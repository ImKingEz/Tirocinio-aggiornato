import google.generativeai as genai
import os
import time
from bs4 import BeautifulSoup, NavigableString
import re

# --- CONFIGURAZIONE ---
API_KEY = os.getenv('GOOGLE_API_KEY')
if not API_KEY:
    raise ValueError("La variabile d'ambiente GOOGLE_API_KEY non è stata impostata.")

MODEL_NAME = "gemini-2.5-pro"
REQUEST_LIMIT_PER_MINUTE = 2

# --- NUOVA CONFIGURAZIONE DEI FILE ---
PROMPT_GENERALE_FILE = "prompt-generale.txt"
HTML_CODE_FILE = "codice-html.txt"
TARGET_TAG_FILE = "tag-target.txt"

OUTPUT_FOLDER = "mutanti"
# --- PROMPT FINALE MODIFICATO PER ESSERE PIÙ ESPLICITO ---
MESSAGGIO_FINALE_PROMPT = "\n\nCome risposta a questo messaggio voglio solamente il codice HTML COMPLETO E MUTATO, senza spiegazioni, commenti o blocchi di codice come ```html o ```. Se la mutazione richiesta non è possibile secondo le regole, restituisci il codice HTML originale che ti ho fornito senza alcuna modifica."

# Mappe (invariate)
mutation_file_map = { 'a': "mutant_{tag_type}_attribute_value_modification.txt", 'b': "mutant_{tag_type}_attribute_removal.txt", 'c': "mutant_{tag_type}_attribute_identifier_modification.txt", 'd': "mutant_{tag_type}_text_content_modification.txt", 'e': "mutant_{tag_type}_text_content_remuval.txt", 'f': "mutant_{tag_type}_html_tag_movement_within_a_container.txt", 'g': "mutant_{tag_type}_html_tag_movement_in_any_point_of_html_three.txt", 'h': "mutant_{tag_type}_html_tag_movement_between_templates.txt", 'i': "mutant_{tag_type}_html_tag_removal.txt", 'j': "mutant_{tag_type}_html_tag_type_modification.txt", 'k': "mutant_{tag_type}_html_tag_insertion.txt" }
element_greek_map = { "target": "alpha", "fratello": "delta", "genitore": "beta", "antenato": "gamma", "template": "epsilon" }

def clean_response(text):
    """Pulisce la risposta dell'API."""
    cleaned_text = re.sub(r'^```[a-zA-Z]*\n', '', text.strip())
    cleaned_text = re.sub(r'\n```$', '', cleaned_text)
    return cleaned_text.strip()

def find_elements(html_code, target_tag_str):
    """Trova gli elementi HTML in modo dinamico, cercando un fratello in entrambe le direzioni."""
    soup = BeautifulSoup(html_code, 'html.parser')
    target_soup = BeautifulSoup(target_tag_str, 'html.parser')
    
    first_target_tag = target_soup.find(True)
    if not first_target_tag: raise ValueError("ERRORE: Il file tag-target.txt sembra vuoto o non valido.")

    # Trova un attributo univoco (preferibilmente x-test-hook) per localizzare il target
    attrs_to_find = {}
    # Diamo priorità assoluta a x-test-hook se esiste
    for attr, value in first_target_tag.attrs.items():
        if attr.startswith('x-test-hook'):
            attrs_to_find = {attr: True if value == '' else value}
            break
    
    if not attrs_to_find:
        # Se non c'è x-test-hook, usa l'id come seconda scelta
        if 'id' in first_target_tag.attrs:
            attrs_to_find = {'id': first_target_tag['id']}
        else:
            # Come ultima spiaggia, usa tutti gli attributi (meno robusto)
            attrs_to_find = first_target_tag.attrs

    target = soup.find(first_target_tag.name, attrs=attrs_to_find)
    if not target: raise ValueError("ERRORE: Tag target non trovato nell'HTML completo. Controlla che gli attributi in tag-target.txt corrispondano esattamente a quelli in codice-html.txt.")

    elements = {"target": target}
    parent = target.find_parent()
    if parent:
        elements["genitore"] = parent
        ancestor = parent.find_parent()
        if ancestor: elements["antenato"] = ancestor

    # Logica corretta per trovare il template
    template = target.find_parent(
        lambda tag: any(re.match(r'^x-test-tpl', attr) for attr in tag.attrs)
    )
    if template: elements["template"] = template
        
    # --- CORREZIONE QUI: Logica per trovare un fratello (sibling) ---
    # 1. Cerca il fratello successivo
    sibling = target.find_next_sibling()
    # Salta i nodi di testo vuoti (come spazi e a capo)
    while sibling and isinstance(sibling, NavigableString) and not sibling.strip():
        sibling = sibling.find_next_sibling()

    # 2. Se non trova un fratello successivo, cerca quello precedente
    if not sibling or isinstance(sibling, NavigableString):
        sibling = target.find_previous_sibling()
        # Salta i nodi di testo vuoti
        while sibling and isinstance(sibling, NavigableString) and not sibling.strip():
            sibling = sibling.find_previous_sibling()
    
    # 3. Se ha trovato un fratello valido (che non è solo testo), lo aggiunge
    if sibling and not isinstance(sibling, NavigableString):
        elements["fratello"] = sibling
        
    return elements

def main():
    """Funzione principale che esegue l'intero processo."""
    print("--- Avvio Script di Mutazione HTML con Google AI ---")
    
    # Setup
    try:
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel(MODEL_NAME)
        print(f"Modello '{MODEL_NAME}' configurato correttamente.")
    except Exception as e:
        print(f"Errore API: {e}"); return
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    print(f"Cartella di output '{OUTPUT_FOLDER}' pronta.")

    # --- MODIFICA: Caricamento dai nuovi file ---
    try:
        with open(PROMPT_GENERALE_FILE, 'r', encoding='utf-8') as f:
            prompt_generale_content = f.read()
        with open(HTML_CODE_FILE, 'r', encoding='utf-8') as f:
            html_code = f.read()
        with open(TARGET_TAG_FILE, 'r', encoding='utf-8') as f:
            target_tag_str = f.read()
        print("File di input (prompt, html, target) caricati correttamente.")
    except FileNotFoundError as e:
        print(f"ERRORE: File non trovato - {e.filename}"); return
        
    # Identificazione dinamica degli elementi
    try:
        elements_to_mutate = find_elements(html_code, target_tag_str)
        original_soup = BeautifulSoup(html_code, 'html.parser')
    except ValueError as e:
        print(f"ERRORE durante l'analisi dell'HTML: {e}"); return

    print("\nElementi identificati:")
    for key, tag in elements_to_mutate.items():
        print(f"- {key.capitalize()} ({element_greek_map.get(key, '')}): <{tag.name}>")
        
    # Variabili per il rate limiting
    request_timestamps = []

    print("\n--- Inizio del processo di generazione delle mutazioni ---")
    for element_type, tag_object in elements_to_mutate.items():
        print(f"\n--- Elaborazione dell'elemento: {element_type.upper()} ---")
        
        greek_letter = element_greek_map.get(element_type, element_type)
        tag_name = tag_object.name
        tag_type_for_filename = f"{greek_letter}({tag_name})"
        
        for mutation_id, filename_template in mutation_file_map.items():
            
            # Logica del Rate Limiter (invariata e corretta)
            while True:
                current_time = time.time()
                request_timestamps = [t for t in request_timestamps if current_time - t < 60]
                if len(request_timestamps) < REQUEST_LIMIT_PER_MINUTE:
                    break
                oldest_request_time = request_timestamps[0]
                wait_time = (oldest_request_time + 60.1) - current_time
                if wait_time > 0:
                    print(f"    -> LIMITE RICHIESTE RAGGIUNTO. Attesa per {wait_time:.1f} secondi...")
                    time.sleep(wait_time)

            request_timestamps.append(time.time())

            try:
                tag_str = str(tag_object)
                
                # --- MODIFICA: Creazione di un prompt completo per ogni chiamata ---
                # Questo approccio è più robusto e previene errori di contesto dell'AI.
                full_prompt = (
                    f"{prompt_generale_content}\n\n"
                    f"--- CODICE HTML COMPLETO SU CUI LAVORARE ---\n"
                    f"```html\n{html_code}\n```\n\n"
                    f"--- ISTRUZIONE SPECIFICA ---\n"
                    f"Applica la mutazione con id '{mutation_id}' al seguente tag (che ho identificato come '{element_type}'):\n"
                    f"```html\n{tag_str}\n```\n"
                    f"{MESSAGGIO_FINALE_PROMPT}"
                )

                print(f"  > Richiesta di mutazione '{mutation_id}' per il tag <{tag_object.name}> ({element_type})...")
                # Utilizziamo generate_content per una singola richiesta stateless
                response = model.generate_content(full_prompt)
                
                mutated_html = clean_response(response.text)
                
                if not mutated_html or not mutated_html.strip().startswith('<'):
                    print(f"    -> RISPOSTA NON VALIDA (non è HTML). Mutazione non salvata.")
                    continue

                mutated_soup = BeautifulSoup(mutated_html, 'html.parser')

                if original_soup.prettify() == mutated_soup.prettify():
                    print(f"    -> NESSUNA MODIFICA RILEVATA. Mutazione '{mutation_id}' non eseguita o non possibile.")
                else:
                    output_filename = filename_template.format(tag_type=tag_type_for_filename)
                    output_filepath = os.path.join(OUTPUT_FOLDER, output_filename)
                    with open(output_filepath, 'w', encoding='utf-8') as f:
                        f.write(mutated_soup.prettify()) # Usiamo prettify per un output ben formattato
                    print(f"    -> SUCCESSO: Mutante salvato in '{output_filepath}'")
                    
            except Exception as e:
                print(f"    -> ERRORE API durante la richiesta di mutazione '{mutation_id}': {e}")
                time.sleep(5)
            
    print("\n--- Processo di mutazione completato! ---")

if __name__ == "__main__":
    main()