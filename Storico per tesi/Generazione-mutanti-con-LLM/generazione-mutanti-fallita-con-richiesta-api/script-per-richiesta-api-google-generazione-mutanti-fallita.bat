@echo off
setlocal

:: ----------- CONFIGURAZIONE -----------
:: Imposta la tua chiave API di Gemini qui
set GEMINI_API_KEY=AIzaSyAi3K4fj3vNdShUY85OrHIkrkKFuEiTNpM

:: Specifica il percorso del tuo file di input
set INPUT_FILE=input.txt

:: Specifica il nome del file di output desiderato
set OUTPUT_FILE=risposta_gemini.txt
:: ------------------------------------

:: File temporanei che verranno creati e poi cancellati
set TEMP_REQUEST_BODY=request_body.json
set TEMP_RAW_RESPONSE=response.json
set TEMP_PROMPT_CONTENT=temp_content.txt

:: Controlla se il file di input esiste
if not exist "%INPUT_FILE%" (
    echo Errore: Il file "%INPUT_FILE%" non trovato.
    goto :cleanup
)

echo Leggendo il contenuto da %INPUT_FILE%...

:: Usa PowerShell per leggere il contenuto del file, garantendo la codifica UTF-8 corretta
powershell -Command "Get-Content -Path '%INPUT_FILE%' -Raw | Set-Content -Path '%TEMP_PROMPT_CONTENT%' -Encoding UTF8 -NoNewline"

:: Controlla se la creazione del file temporaneo è riuscita
if not exist "%TEMP_PROMPT_CONTENT%" (
    echo Errore: Impossibile creare il file temporaneo.
    goto :cleanup
)

:: Genera il corpo della richiesta JSON usando una pipe (metodo robusto)
type "%TEMP_PROMPT_CONTENT%" | jq -R -s "{ \"contents\": [ { \"parts\": [ { \"text\": . } ] } ] }" > "%TEMP_REQUEST_BODY%"

:: Controlla se la generazione del corpo della richiesta è riuscita
if not exist "%TEMP_REQUEST_BODY%" (
    echo Errore: Impossibile generare il corpo della richiesta JSON. Assicurati che jq sia installato e nel PATH.
    goto :cleanup
)

echo Invio della richiesta a Gemini...

:: Esegui la richiesta e salva la risposta JSON completa in un file temporaneo
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent" ^
  -H "Content-Type: application/json" ^
  -H "X-goog-api-key: %GEMINI_API_KEY%" ^
  -X POST ^
  -d "@%TEMP_REQUEST_BODY%" > "%TEMP_RAW_RESPONSE%"

:: Controlla se la risposta dell'API contiene un errore
findstr /C:"\"error\":" "%TEMP_RAW_RESPONSE%" >nul
if %errorlevel% == 0 (
    echo.
    echo !!! ERRORE RICEVUTO DALL'API DI GEMINI !!!
    echo La risposta completa e' stata salvata in %TEMP_RAW_RESPONSE%
    type "%TEMP_RAW_RESPONSE%"
    goto :cleanup_with_error
)

echo Estrazione del testo e salvataggio in %OUTPUT_FILE%...

:: Usa jq per estrarre il testo pulito dalla risposta JSON e salvarlo nel file di output finale
:: -r (raw-output) rimuove le virgolette dalla stringa di testo estratta
jq -r ".candidates[0].content.parts[0].text" "%TEMP_RAW_RESPONSE%" > "%OUTPUT_FILE%"

echo.
echo Operazione completata. Risposta salvata in: %OUTPUT_FILE%


:cleanup
:: Pulisci tutti i file temporanei
if exist "%TEMP_PROMPT_CONTENT%" del "%TEMP_PROMPT_CONTENT%"
if exist "%TEMP_REQUEST_BODY%" del "%TEMP_REQUEST_BODY%"
if exist "%TEMP_RAW_RESPONSE%" del "%TEMP_RAW_RESPONSE%"
goto :eof

:cleanup_with_error
:: In caso di errore, non cancelliamo il file di risposta per poterlo analizzare
if exist "%TEMP_PROMPT_CONTENT%" del "%TEMP_PROMPT_CONTENT%"
if exist "%TEMP_REQUEST_BODY%" del "%TEMP_REQUEST_BODY%"

:eof
echo.
pause