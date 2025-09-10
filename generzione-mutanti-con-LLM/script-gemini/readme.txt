### PREREQUISITI

Esegui in Powershell questi comandi:
1) pip install google-generativeai beautifulsoup4
2) pip install -U google-genai

Crea un api key su https://aistudio.google.com/apikey e inseriscila come variabile d'ambiente con questo comando:
- $env:GOOGLE_API_KEY="LA_TUA_KEY"

Istruzioni per la generazione automatica dei mutanti tramite Gemini AI:

1) Inserisci il codice html da mutare in codice-html.txt
2) Inserisci il tag target in tag-target.txt
3) Apri in Powershell la cartella Generazione-mutanti-automatica
4) Avvia lo script:
	python automazione_mutazioni.py