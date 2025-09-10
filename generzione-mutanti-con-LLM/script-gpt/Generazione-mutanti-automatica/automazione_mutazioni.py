import os
import time
import openai
from bs4 import BeautifulSoup, NavigableString, Comment
import re
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import html as html_lib

def is_semantically_equal(html_original: str, html_mutated: str) -> bool:
    """
    Compara due stringhe HTML in modo semantico, ignorando l'ordine degli attributi,
    i commenti e gli spazi bianchi insignificanti tra i tag.

    Args:
        html_original: La stringa HTML originale.
        html_mutated: La stringa HTML mutata.

    Returns:
        True se i due HTML sono semanticamente equivalenti, False altrimenti.
    """
    def _normalize_soup(soup):
        # 1. Rimuovi tutti i commenti HTML
        for comment in soup.find_all(string=lambda text: isinstance(text, Comment)):
            comment.extract()
        
        # 2. Rimuovi i nodi di testo contenenti solo spazi bianchi (per normalizzare l'indentazione)
        #    Questo aiuta a rendere il confronto più robusto contro cambiamenti di formattazione.
        for nav_string in soup.find_all(text=True):
            if isinstance(nav_string, NavigableString) and not nav_string.strip():
                nav_string.extract()
        return soup

    try:
        # Crea e normalizza il "soup" per entrambi gli HTML
        soup_original = _normalize_soup(BeautifulSoup(html_original, 'html.parser'))
        soup_mutated = _normalize_soup(BeautifulSoup(html_mutated, 'html.parser'))
        
        # 3. Usa l'operatore di uguaglianza di BeautifulSoup che confronta la struttura
        #    e gli attributi in modo insensibile all'ordine.
        return soup_original == soup_mutated
    except Exception as e:
        # In caso di errore di parsing, considerali diversi per sicurezza
        logger.error(f"Errore durante il confronto semantico dell'HTML: {e}")
        return False

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'mutation_log_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'o4-mini-2025-04-16')

if not OPENAI_API_KEY:
    raise ValueError("Devi impostare OPENAI_API_KEY come variabile d'ambiente.")

TEST_MODE_SINGLE_REQUEST = False

try:
    client = openai.OpenAI(api_key=OPENAI_API_KEY)
except Exception as e:
    logger.error(f"Errore durante la configurazione del client OpenAI: {e}")
    raise

MAX_RETRIES = 3
RETRY_DELAY = 5

PROMPT_GENERALE_FILE = "prompt-generale.txt"
HTML_CODE_FILE = "codice-html.txt"
TARGET_TAG_FILE = "tag-target.txt"

OUTPUT_FOLDER = "mutanti"
REPORT_FILE = "mutation_report.json"

MESSAGGIO_FINALE_PROMPT = """
⚠️ CRITICAL FINAL INSTRUCTIONS FOR ANGULAR:

1. **OUTPUT**: Return ONLY the complete and mutated HTML code.
2. **FORMAT**: DO NOT include explanations, comments, or markdown blocks (```html).
3. **ANGULAR SYNTAX**:
   - PRESERVE EXACTLY the case-sensitivity of ALL Angular attributes.
   - Maintain the directive syntax: *ngFor, *ngIf, [binding], (event), [(two-way)].
   - NEVER modify attributes that start with x-test-.
4. **VALIDITY**:
   - The HTML must remain valid for Angular 19.
   - Expressions in interpolations {{ }} must remain syntactically correct.
   - Form bindings must maintain their structure.
5. **FALLBACK**: If the requested mutation would compromise Angular validity, apply a safe alternative mutation or return the original.

IMPORTANT: The mutated code MUST be able to be compiled and run in Angular 19 without errors.
"""

mutation_file_map = {
    'a': "mutant_{tag_type}_attribute_value_modification.txt", 'b': "mutant_{tag_type}_attribute_removal.txt",
    'c': "mutant_{tag_type}_attribute_identifier_modification.txt", 'd': "mutant_{tag_type}_text_content_modification.txt",
    'e': "mutant_{tag_type}_text_content_removal.txt", 'f': "mutant_{tag_type}_html_tag_movement_within_container.txt",
    'g': "mutant_{tag_type}_html_tag_movement_anywhere.txt", 'h': "mutant_{tag_type}_html_tag_movement_between_templates.txt",
    'i': "mutant_{tag_type}_html_tag_removal.txt", 'j': "mutant_{tag_type}_html_tag_type_modification.txt",
    'k': "mutant_{tag_type}_html_tag_insertion.txt"
}
mutation_descriptions = {
    'a': "Modifica valore attributo", 'b': "Rimozione attributo", 'c': "Modifica identificatore attributo",
    'd': "Modifica contenuto testuale", 'e': "Rimozione contenuto testuale", 'f': "Spostamento tag nel container",
    'g': "Spostamento tag ovunque", 'h': "Spostamento tra template", 'i': "Rimozione tag", 'j': "Modifica tipo tag",
    'k': "Inserimento nuovo tag"
}

mutation_details = {
    'a': """### ID "a" - Modify Attribute Value
**Description**: Modifies the value of an existing attribute in the tag.
**Attribute priority**: 1) `id`, 2) `class`, 3) other attributes (excluding `x-test-*`), but DO NOT remove critical Angular structural attributes.
**Angular Example**:
```html
<!-- Before -->
<button class="btn-primary" [disabled]="isLoading">Save</button>
<!-- After -->
<button class="btn-secondary" [disabled]="isLoading">Save</button>
```""",
    'b': """### ID "b" - Remove Attribute
**Description**: Completely removes an attribute from the tag.
**Attribute priority**: 1) `id`, 2) `class`, 3) other attributes (excluding `x-test-*`), but DO NOT remove critical Angular structural attributes.
**Angular Example**:
```html
<!-- Before -->
<input type="text" id="username" [(ngModel)]="user.name" required>
<!-- After -->
<input type="text" [(ngModel)]="user.name" required>
```""",
    'c': """### ID "c" - Modify Attribute Identifier
**Description**: Changes the attribute's name while keeping its value.
**Attribute priority**: 1) `id`, 2) `class`, 3) other attributes (excluding `x-test-*`), but DO NOT remove critical Angular structural attributes.
**Warning**: DO NOT modify Angular syntax ([], (), *, [()]).
**Angular Example**:
```html
<!-- Before -->
<div class="panel" data-testid="panel-1">
<!-- After -->
<div className="panel" data-testid="panel-1">
```""",
    'd': """### ID "d" - Modify Text Content
**Description**: Modifies the direct text of the tag (not in child tags).
**Angular Example**:
```html
<!-- Before -->
<label>{{ 'user.name' | translate }}</label>
<!-- After -->
<label>{{ 'user.fullname' | translate }}</label>
```""",
    'e': """### ID "e" - Remove Text Content
**Description**: Removes only the direct text content (not in child tags).
**Angular Example**:
```html
<!-- Before -->
<span>Text to remove {{ variable }}</span>
<!-- After -->
<span>{{ variable }}</span>
```""",
    'f': """### ID "f" - Move within Container
**Description**: Moves the tag (with him child tags) to another position INSIDE its parent container.
**Constraint**: It must remain in the same container.
**Angular Example**:
```html
<!-- Before -->
<div>
  <input [(ngModel)]="value">
  <button>Submit</button>
</div>
<!-- After -->
<div>
  <button>Submit</button>
  <input [(ngModel)]="value">
</div>
```""",
    'g': """### ID "g" - Global Move
**Description**: Moves the tag (with him child tags) to ANY valid location in the HTML.
**Warning**: Maintain dependencies for forms and bindings.
**Example**: An element can be moved from inside a form to outside it (if it doesn't break bindings).""",
    'h': """### ID "h" - Move between Templates
**Description**: Moves the tag (with him child tags) to another `ng-template` or component.
**Constraint**: Requires at least 2 templates in the code.
**Template identification**: Look for `x-test-tpl*` attributes or `<ng-template>` tags.
**Angular Example**:
```html
<!-- Before: in template A -->
<ng-template #templateA>
  <button (click)="action()">Click</button>
</ng-template>
<!-- After: moved to template B -->
<ng-template #templateB>
  <button (click)="action()">Click</button>
  <span>Other content...</span>
</ng-template>
```""",
    'i': """### ID "i" - Remove Tag (Unwrap)
**Description**: Removes ONLY the tag, keeping its content.
**Angular Example**:
```html
<!-- Before -->
<div class="wrapper">
  <span>Content</span>
  <button>Click</button>
</div>
<!-- After (div removed) -->
<span>Content</span>
<button>Click</button>
```""",
    'j': """### ID "j" - Modify Tag Type
**Description**: Changes the HTML tag type, keeping attributes and content.
**Constraint**: Use only standard HTML5 tags valid for the context.
**Angular Example**:
```html
<!-- Before -->
<span class="text" (click)="handleClick()">Click here</span>
<!-- After -->
<button class="text" (click)="handleClick()">Click here</button>
```""",
    'k': """### ID "k" - Insert New Tag
**Description**: Adds a new tag as a sibling to the target.
**Position**: Before or after the target tag.
**Angular Example**:
```html
<!-- Before -->
<input [(ngModel)]="email" type="email">
<!-- After -->
<input [(ngModel)]="email" type="email">
<span class="helper-text">Enter a valid email</span>
```"""
}


element_greek_map = {"target": "alpha", "fratello": "delta", "genitore": "beta", "antenato": "gamma", "template": "epsilon"}

class MutationValidator:
    @staticmethod
    def validate_angular_syntax(html: str) -> Tuple[bool, List[str]]:
        errors, soup = [], BeautifulSoup(html, 'html.parser')
        for tag in soup.find_all(True):
            for attr in tag.attrs:
                if attr.startswith('[') and not attr.endswith(']'): errors.append(f"Binding malformato: {attr}")
                if attr.startswith('(') and not attr.endswith(')'): errors.append(f"Event binding malformato: {attr}")
                if attr.startswith('[(') and not attr.endswith(')]'): errors.append(f"Two-way binding malformato: {attr}")
        for interp in re.findall(r'\{\{[^}]*\}\}', html):
            if interp.count('{{') != interp.count('}}'): errors.append(f"Interpolazione malformata: {interp}")
        return len(errors) == 0, errors
    @staticmethod
    def check_form_integrity(original: str, mutated: str) -> bool:
        original_soup, mutated_soup = BeautifulSoup(original, 'html.parser'), BeautifulSoup(mutated, 'html.parser')
        original_forms = original_soup.find_all(attrs={'[formgroup]': True})
        mutated_forms = mutated_soup.find_all(attrs={'[formgroup]': True})
        if len(original_forms) > 0 and len(mutated_forms) == 0: logger.warning("Form groups persi nella mutazione"); return False
        return True

def clean_response_robust(raw_text: Optional[str]) -> str:
    if not raw_text:
        return ''

    text = raw_text.strip()

    try:
        if (text.startswith('{') and text.endswith('}')) or text.startswith('{"'):
            parsed = json.loads(text)
            if isinstance(parsed, dict):
                for key in ('html', 'output_html', 'content', 'result'):
                    if key in parsed and isinstance(parsed[key], str) and '<' in parsed[key]:
                        candidate = parsed[key].strip()
                        return html_lib.unescape(candidate)
    except Exception:
        pass

    m = re.search(r'"html"\s*:\s*"([^"]*<[^"]*)"', text, re.DOTALL)
    if m:
        return html_lib.unescape(m.group(1))

    m = re.search(r'```(?:html)?\s*\n(.*?)\n```', text, re.DOTALL | re.IGNORECASE)
    if m:
        candidate = m.group(1).strip()
        return html_lib.unescape(candidate)

    first = text.find('<')
    last = text.rfind('>')
    if first != -1 and last != -1 and last > first:
        candidate = text[first:last+1].strip()
        candidate = re.sub(r'<!--\s*MUTATION:.*?-->', '', candidate, flags=re.DOTALL)
        return html_lib.unescape(candidate)

    return ''

def extract_text_from_response(response) -> str:
    try:
        if getattr(response, "choices", None):
            choice0 = response.choices[0]
            if getattr(choice0, "message", None) and getattr(choice0.message, "content", None):
                return choice0.message.content
            if getattr(choice0, "text", None):
                return choice0.text
    except Exception:
        pass

    try:
        if hasattr(response, "output"):
            out = response.output
            if isinstance(out, str) and out.strip():
                return out
            if isinstance(out, (list, dict)):
                try:
                    return json.dumps(out)
                except Exception:
                    return str(out)
    except Exception:
        pass

    try:
        return str(response)
    except Exception:
        return ''


def find_elements(html_code: str, target_tag_str: str) -> Dict:
    soup, target_soup = BeautifulSoup(html_code, 'html.parser'), BeautifulSoup(target_tag_str, 'html.parser')
    first_target_tag = target_soup.find(True)
    if not first_target_tag: raise ValueError("ERRORE: Il file tag-target.txt sembra vuoto o non valido.")
    attrs_to_find = {}
    for attr, value in first_target_tag.attrs.items():
        if attr.startswith('x-test-hook'): attrs_to_find = {attr: True if value == '' else value}; break
    if not attrs_to_find and 'id' in first_target_tag.attrs: attrs_to_find = {'id': first_target_tag['id']}
    if not attrs_to_find:
        angular_attrs = {attr: value for attr, value in first_target_tag.attrs.items() if any(attr.startswith(p) for p in ['*ng', '[', '(', '[('])}
        if angular_attrs: attrs_to_find = angular_attrs
    if not attrs_to_find: attrs_to_find = first_target_tag.attrs
    target = soup.find(first_target_tag.name, attrs=attrs_to_find)
    if not target: target = soup.find(first_target_tag.name)
    if not target: raise ValueError(f"ERRORE: Tag target <{first_target_tag.name}> non trovato nell'HTML.")
    elements = {"target": target}
    parent = target.find_parent()
    if parent and parent.name != '[document]':
        elements["genitore"] = parent
        ancestor = parent.find_parent()
        if ancestor and ancestor.name != '[document]': elements["antenato"] = ancestor
    template = target.find_parent(lambda tag: any(re.match(r'^x-test-tpl', attr) for attr in tag.attrs) or tag.name in ['ng-template', 'ng-container'])
    if template: elements["template"] = template
    def find_valid_sibling(element):
        for sibling_func in [element.find_next_sibling, element.find_previous_sibling]:
            sibling = sibling_func()
            while sibling:
                if not isinstance(sibling, NavigableString): return sibling
                if sibling.strip(): return None
                sibling = sibling_func()
        return None
    sibling = find_valid_sibling(target)
    if sibling: elements["fratello"] = sibling
    return elements

def optimize_prompt(prompt_content: str, html_code: str, target_tag: str, mutation_id: str, element_type: str) -> str:
    specific_mutation_info = mutation_details.get(mutation_id, "Descrizione non trovata.")
    
    base_prompt = f"""{prompt_content}

--- TASK: SPECIFIC MUTATION TO APPLY ---
You must apply ONLY the following mutation:
{specific_mutation_info}

--- FULL HTML CODE TO MUTATE ---
```html
{html_code}
```

--- TARGET ELEMENT TO FOCUS ON ---
Within the code above, find an element similar to this and apply the mutation to it: `{target_tag}`.
The element being mutated is the "{element_type}" in the element hierarchy.

--- FINAL INSTRUCTIONS ---
Remember to return the ENTIRE, modified HTML code. Your response must contain only the code, as specified in the general rules.

{MESSAGGIO_FINALE_PROMPT}"""
    
    return base_prompt

def call_openai_api(prompt: str, model_name: str = OPENAI_MODEL) -> Optional[str]:
    for attempt in range(MAX_RETRIES):
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
            )
            text = extract_text_from_response(response)
            cleaned_text = clean_response_robust(text)

            if cleaned_text:
                return cleaned_text
            else:
                logger.warning("Risposta di OpenAI vuota dopo il clean_response")
                return None
        
        except openai.APIError as e:
            logger.error(f"Errore API OpenAI al tentativo {attempt + 1}: {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY * (attempt + 1))
            else:
                return None
        except Exception as e:
            logger.error(f"Errore inatteso durante la chiamata a OpenAI: {e}", exc_info=True)
            return None
            
    return None

def make_llm_call(prompt: str) -> Optional[str]:
    if OPENAI_API_KEY:
        return call_openai_api(prompt)
    logger.warning("OPENAI_API_KEY non impostato, impossibile effettuare la chiamata.")
    return None

def generate_mutation_report(results: List[Dict]) -> None:
    if not results:
        logger.info("Nessun risultato da includere nel report.")
        return
        
    report = {
        "timestamp": datetime.now().isoformat(),
        "total_mutations_attempted": len(results),
        "successful_mutations": sum(1 for r in results if r["success"]),
        "failed_mutations": sum(1 for r in results if not r["success"]),
        "mutations": results,
        "statistics": {"by_type": {}, "by_element": {}}
    }
    
    for result in results:
        mut_type, elem_type = result["mutation_type"], result["element_type"]
        report["statistics"]["by_type"].setdefault(mut_type, {"success": 0, "failed": 0})
        report["statistics"]["by_element"].setdefault(elem_type, {"success": 0, "failed": 0})
        
        if result["success"]:
            report["statistics"]["by_type"][mut_type]["success"] += 1
            report["statistics"]["by_element"][elem_type]["success"] += 1
        else:
            report["statistics"]["by_type"][mut_type]["failed"] += 1
            report["statistics"]["by_element"][elem_type]["failed"] += 1
            
    with open(REPORT_FILE, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
        
    logger.info(f"Report salvato in {REPORT_FILE}")

def main():
    logger.info("=== Avvio Script di Mutazione HTML per Angular con OpenAI (Prompt Mirato) ===")
    if TEST_MODE_SINGLE_REQUEST:
        logger.warning("--- ATTENZIONE: ESECUZIONE IN MODALITÀ TEST (UNA SOLA RICHIESTA) ---")
        
    try:
        validator = MutationValidator()
        logger.info("Sistema di validazione configurato correttamente")
    except Exception as e:
        logger.error(f"Errore configurazione: {e}")
        return
        
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    
    try:
        with open(PROMPT_GENERALE_FILE, 'r', encoding='utf-8') as f:
            prompt_generale_content = f.read()
        with open(HTML_CODE_FILE, 'r', encoding='utf-8') as f:
            html_code = f.read()
        with open(TARGET_TAG_FILE, 'r', encoding='utf-8') as f:
            target_tag_str = f.read()
        logger.info("File di input caricati correttamente")
    except FileNotFoundError as e:
        logger.error(f"File non trovato: {e.filename}")
        return
        
    is_valid, errors = validator.validate_angular_syntax(html_code)
    if not is_valid:
        logger.warning(f"HTML originale contiene errori Angular: {errors}")
        
    try:
        elements_to_mutate = find_elements(html_code, target_tag_str)
        original_soup = BeautifulSoup(html_code, 'html.parser')
    except ValueError as e:
        logger.error(f"Errore analisi HTML: {e}")
        return
        
    logger.info("\nElementi identificati:")
    for key, tag in elements_to_mutate.items():
        logger.info(f"  • {key.capitalize()} ({element_greek_map.get(key, '')}): <{tag.name}> con {len(tag.attrs)} attributi")
        
    results = []
    total_requests = len(elements_to_mutate) * len(mutation_file_map)
    current_request = 0
    
    logger.info(f"\n=== Inizio generazione {total_requests} mutazioni ===\n")
    
    try:
        for element_type, tag_object in elements_to_mutate.items():
            logger.info(f"\n--- Elaborazione elemento: {element_type.upper()} ---")
            tag_type_for_filename = f"{element_greek_map.get(element_type, element_type)}({tag_object.name})"
            
            for mutation_id, filename_template in mutation_file_map.items():
                current_request += 1
                result = {
                    "element_type": element_type, "mutation_type": mutation_id, 
                    "mutation_description": mutation_descriptions[mutation_id], 
                    "tag_name": tag_object.name, "success": False, "filename": None, 
                    "error": None, "validation_errors": []
                }
                
                try:
                    optimized_prompt = optimize_prompt(prompt_generale_content, html_code, str(tag_object), mutation_id, element_type)
                    logger.info(f"  [{current_request}/{total_requests}] Mutazione '{mutation_id}' - {mutation_descriptions[mutation_id]}")
                    
                    mutated_html = make_llm_call(optimized_prompt)
                    
                    if not mutated_html:
                        logger.warning(f"    [!] Nessuna risposta valida ricevuta")
                        result["error"] = "Nessuna risposta dall'API"
                        results.append(result)
                        time.sleep(2)
                        continue
                        
                    if not mutated_html.strip().startswith('<'):
                        logger.warning(f"    [!] Risposta non è HTML valido")
                        result["error"] = "Risposta non è HTML"
                        results.append(result)
                        time.sleep(2)
                        continue
                        
                    mutated_soup = BeautifulSoup(mutated_html, 'html.parser')
                    is_valid, validation_errors = validator.validate_angular_syntax(mutated_html)
                    
                    if not is_valid:
                        logger.warning(f"    [!] Errori di sintassi Angular: {validation_errors[:3]}")
                        result["validation_errors"] = validation_errors
                        
                    if not validator.check_form_integrity(html_code, mutated_html):
                        logger.warning(f"    [!] Possibile perdita di integrità dei form")
                        result["validation_errors"].append("Form integrity compromised")
                        
                    # NUOVO CONTROLLO ROBUSTO
                    if is_semantically_equal(html_code, mutated_html):
                        logger.info(f"    [INFO] Nessuna modifica semantica rilevata (mutazione non applicata o inutile)")
                        result["error"] = "Nessuna modifica applicata"
                    else:
                        output_filename = filename_template.format(tag_type=tag_type_for_filename)
                        output_filepath = os.path.join(OUTPUT_FOLDER, output_filename)
                        # Usiamo ancora prettify() per scrivere file leggibili
                        with open(output_filepath, 'w', encoding='utf-8') as f:
                            f.write(mutated_soup.prettify())
                        logger.info(f"    ✅ Mutante salvato: {output_filename}")
                        result["success"] = True
                        result["filename"] = output_filename
                        
                    results.append(result)
                    
                except Exception as e:
                    logger.error(f"    ❌ Errore critico nel loop principale: {e}", exc_info=True)
                    result["error"] = str(e)
                    results.append(result)
                    
                if TEST_MODE_SINGLE_REQUEST:
                    logger.info("\n--- MODALITÀ TEST ATTIVA: Interruzione dopo la prima richiesta API. ---")
                    raise KeyboardInterrupt("Modalità test completata")

                time.sleep(2)
    
    except KeyboardInterrupt:
        logger.warning("\n\n=== INTERRUZIONE RICHIESTA DALL'UTENTE (CTRL+C) O FINE MODALITÀ TEST ===")
        logger.info("Generazione del report per le mutazioni completate fino a questo punto...")

    generate_mutation_report(results)
    
    successful = sum(1 for r in results if r["success"])
    total_attempted = len(results)
    
    logger.info("\n" + "="*50)
    logger.info(f"COMPLETATO: {successful}/{total_attempted} mutazioni generate con successo")
    if total_attempted > 0:
        logger.info(f"Fallite: {total_attempted - successful}")
    logger.info(f"Report dettagliato salvato in: {REPORT_FILE}")
    logger.info("="*50)

if __name__ == "__main__":
    main()