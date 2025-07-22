#!/bin/bash

# ==============================================================================
#           SCRIPT PER ESECUZIONE TEST DI MUTAZIONE SU APPLICAZIONE ANGULAR
# ==============================================================================
#
# Questo script automatizza il processo di test di mutazione:
# 1. Avvia un'applicazione Angular.
# 2. Cicla attraverso diversi tipi di locator Selenium (es. hook, robula, etc.).
# 3. Per ogni tipo di locator, cicla attraverso una serie di file "mutanti".
# 4. Per ogni mutante:
#    a. Sostituisce un file sorgente dell'app con il mutante.
#    b. Attende la ricompilazione di Angular.
#    c. Esegue una suite di test Maven/TestNG specifica per il locator.
#    d. Registra il risultato (success/failure) e la causa del fallimento.
#    e. Ripristina il file sorgente originale.
# 5. Produce un file CSV completo con tutti i risultati.
#

# === CONFIGURAZIONE ===
echo "=== INIZIO PROCESSO DI TEST DI MUTAZIONE ==="
START_TIME=$(date +%s)

# --- PERCORSI FISSI E ROBUSTI ALL'INTERNO DEL CONTAINER ---
# Salva la directory di lavoro radice (/app) per garantire percorsi assoluti
SCRIPT_ROOT_DIR=$(pwd)

APP_ROOT_DIR="${SCRIPT_ROOT_DIR}/frontend" # La root dell'app Angular
MAVEN_PROJECT_ROOT="${SCRIPT_ROOT_DIR}/selenium-tests"     # La root del progetto Maven per i test
TESTNG_SUITES_DIR="${SCRIPT_ROOT_DIR}/testng_suites"       # Directory con le suite di test TestNG
SOURCE_DIR="${SCRIPT_ROOT_DIR}/mutantsToTest"              # Directory con i file HTML mutanti

# --- DIRECTORY DI OUTPUT (create fuori dalla struttura del progetto) ---
LOG_DIR="${SCRIPT_ROOT_DIR}/output_logs"
CSV_DIR="${SCRIPT_ROOT_DIR}/output_csv"
SCREENSHOT_DIR="${SCRIPT_ROOT_DIR}/output_screenshots"

mkdir -p "$LOG_DIR" "$CSV_DIR" "$SCREENSHOT_DIR"
echo "Directory di output preparate."

# --- FILE DI LOG E RISULTATI (definiti con percorsi assoluti) ---
TIMESTAMP=$(date +"%d-%m-%Y_%H-%M-%S")
LOG_FILE="${LOG_DIR}/ng-serve.log"
RESULT_LOG="${LOG_DIR}/mutant_test_results_${TIMESTAMP}.log"
MAVEN_TEST_LOG="${LOG_DIR}/maven_test_output.log"
GLOBAL_CSV_FILE="${CSV_DIR}/all_mutants_results_${TIMESTAMP}.csv"

# --- CONFIGURAZIONE TEST (FILE TARGET DINAMICO) ---
if [ -z "$TARGET_FILE" ]; then
    echo "❌ Errore Critico: La variabile d'ambiente TARGET_FILE non è stata impostata." >&2
    echo "   Usa il flag '-e TARGET_FILE=\"percorso/relativo/al/file.html\"' nel comando docker run." >&2
    exit 1
fi

# Il percorso del file target è relativo alla root dell'app Angular
DEST_FILE="${APP_ROOT_DIR}/${TARGET_FILE}"
TARGET_FILENAME=$(basename "$TARGET_FILE")
BACKUP_FILE="/tmp/backup_${TARGET_FILENAME}"

echo "File target per la mutazione: $DEST_FILE"

if [ ! -f "$DEST_FILE" ]; then
    echo "❌ Errore Critico: Il file target specificato non esiste nel percorso: $DEST_FILE" >&2
    exit 1
fi

LOCATOR_TYPES=("hook" "absolute" "relative" "robula" "selenium" "katalon")

# Pulizia di esecuzioni precedenti
echo "Pulizia di log e screenshot di esecuzioni precedenti..."
rm -f "$LOG_DIR"/*_results_*.log "$LOG_DIR"/*.log
rm -rf "$SCREENSHOT_DIR"/*

# === PREPARAZIONE AMBIENTE ===

# 1. Backup del file originale per ripristinarlo dopo ogni mutazione
echo "Creazione backup del file HTML originale..."
cp "$DEST_FILE" "$BACKUP_FILE"

# 2. Pre-installazione delle dipendenze Maven
echo "Installazione delle dipendenze Maven per il progetto di test (mvn clean install -DskipTests)..."
cd "$MAVEN_PROJECT_ROOT"
mvn clean install -DskipTests > "${LOG_DIR}/maven_initial_setup.log" 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Errore critico durante 'mvn clean install'. Controllare il file '${LOG_DIR}/maven_initial_setup.log'."
    exit 1
fi
echo "✅ Dipendenze Maven installate."

# 3. Avvio dell'applicazione Angular
echo "Avvio dell'applicazione Angular..."
cd "$APP_ROOT_DIR"
if [ ! -d "node_modules" ]; then
    echo "Esecuzione 'npm install' per l'applicazione Angular..."
    npm install --silent
fi

# Assicurati che la directory di log esista prima di avviare ng serve
# (già fatto all'inizio, ma non fa male qui)
mkdir -p "$LOG_DIR"

(ng serve --host 0.0.0.0 > "$LOG_FILE" 2>&1 &)
NG_PID=$!

# AGGIUNTA: Attesa per la creazione del file di log da parte di ng serve
echo "In attesa che il file di log di Angular sia creato ($LOG_FILE)..."
MAX_WAIT_FOR_LOG_FILE=10 # secondi
ELAPSED_WAIT_FOR_LOG_FILE=0
while [ ! -f "$LOG_FILE" ] && [ $ELAPSED_WAIT_FOR_LOG_FILE -lt $MAX_WAIT_FOR_LOG_FILE ]; do
    sleep 0.5 # Aspetta mezzo secondo
    ELAPSED_WAIT_FOR_LOG_FILE=$((ELAPSED_WAIT_FOR_LOG_FILE + 1))
done

if [ ! -f "$LOG_FILE" ]; then
    echo "❌ Errore: Il file di log di Angular ($LOG_FILE) non è stato creato entro ${MAX_WAIT_FOR_LOG_FILE} secondi."
    if [ ! -z "$NG_PID" ]; then
        kill $NG_PID
    fi
    exit 1
fi

# Attesa avvio iniziale di Angular
# MODIFICA: Utilizza -E per l'espressione regolare "OR" come nella sezione successiva
echo "In attesa che l'applicazione Angular si avvii (max 180s)..."
if ! timeout 180 grep -q -E "Application bundle generation complete|Compiled successfully" <(tail -f "$LOG_FILE"); then
    echo "❌ Timeout durante l'avvio iniziale di Angular. Lo script verrà interrotto."
    cat "$LOG_FILE"
    if [ ! -z "$NG_PID" ]; then
        kill $NG_PID
    fi
    exit 1
fi
echo "✅ Applicazione Angular avviata con successo."


# === ESECUZIONE CICLO DI TEST ===

# Inizializza il file CSV per i risultati globali
echo "locator_type,mutant,result,failure_cause" > "$GLOBAL_CSV_FILE"
echo "Inizio del ciclo di test sui mutanti..."

# Cicla su ogni tipo di locator
for CURRENT_LOCATOR_TYPE in "${LOCATOR_TYPES[@]}"; do
    echo "====================================================="
    echo "=== ESECUZIONE TEST CON LOCATOR: ${CURRENT_LOCATOR_TYPE} ==="
    echo "====================================================="

    CURRENT_TEST_SUITE_FILE="${TESTNG_SUITES_DIR}/testng-${CURRENT_LOCATOR_TYPE}.xml"
    if [ ! -f "$CURRENT_TEST_SUITE_FILE" ]; then
        echo "⚠️  Attenzione: File suite TestNG non trovato per ${CURRENT_LOCATOR_TYPE} in ${TESTNG_SUITES_DIR}. Salto questo locator."
        echo "${CURRENT_LOCATOR_TYPE},N/A,error,\"TestNG suite file not found\"" >> "$GLOBAL_CSV_FILE"
        continue
    fi

    # Ciclo su ogni file mutante
    for MUTANT_FILE in "$SOURCE_DIR"/*; do
        CURRENT_MUTANT_NAME=$(basename "$MUTANT_FILE")
        echo "-------------------------------------"
        echo "Processing Mutant: $CURRENT_MUTANT_NAME (Locator Type: $CURRENT_LOCATOR_TYPE)"

        # 1. Applica il mutante
        cp "$MUTANT_FILE" "$DEST_FILE"

        # 2. Attendi la ricompilazione di Angular
        echo "Mutante applicato. In attesa della ricompilazione di Angular (max 30s)..."
        truncate -s 0 "$LOG_FILE"
        
        if ! timeout 30 grep -q -E "Application bundle generation complete|Compiled successfully" <(tail -f "$LOG_FILE"); then
            echo "❌ Timeout durante la ricompilazione di Angular. Il test potrebbe fallire."
        else
            echo "✅ Angular ha ricompilato."
            sleep 2 # Pausa aggiuntiva per stabilizzazione
        fi

        # 3. Esegui i test Maven
        cd "$MAVEN_PROJECT_ROOT"
        echo "Esecuzione test Maven..."
        mvn test -Dtest.suite.file="$CURRENT_TEST_SUITE_FILE" -Dscreenshot.path="$SCREENSHOT_DIR" > "$MAVEN_TEST_LOG" 2>&1
        TEST_EXIT_CODE=$?

        # 4. Analizza il risultato
        TEST_RESULT="failure"
        FAILURE_CAUSE="Unknown cause. Check $MAVEN_TEST_LOG for details."

        if [ "$TEST_EXIT_CODE" -eq 0 ]; then
            TEST_RESULT="success"
            FAILURE_CAUSE="N/A"
        else
            if grep -q "org.openqa.selenium.NoSuchElementException" "$MAVEN_TEST_LOG"; then
                FAILURE_CAUSE="Selenium: NoSuchElementException"
            elif grep -q "org.openqa.selenium.TimeoutException" "$MAVEN_TEST_LOG"; then
                FAILURE_CAUSE="Selenium: TimeoutException"
            elif grep -q "org.openqa.selenium.ElementNotInteractableException" "$MAVEN_TEST_LOG"; then
                FAILURE_CAUSE="Selenium: ElementNotInteractableException"
            elif grep -q "org.openqa.selenium.ElementClickInterceptedException" "$MAVEN_TEST_LOG"; then
                FAILURE_CAUSE="Selenium: ElementClickInterceptedException"
            elif grep -q "java.lang.AssertionError" "$MAVEN_TEST_LOG"; then
                FAILURE_CAUSE="TestNG: AssertionError"
            elif grep -q "Could not start a new session" "$MAVEN_TEST_LOG"; then
                FAILURE_CAUSE="Selenium: Could not start a new session (WebDriver/Browser issue)"
            else
                FAILURE_CAUSE="Generic Maven Test Failure"
            fi
        fi
        
        echo "Risultato: $TEST_RESULT"

        # 5. Scrivi i risultati nei file di log e CSV
        echo "${CURRENT_LOCATOR_TYPE},${CURRENT_MUTANT_NAME},${TEST_RESULT},\"${FAILURE_CAUSE}\"" >> "$GLOBAL_CSV_FILE"
        
        {
            echo "Timestamp: $(date)"
            echo "Locator Type: ${CURRENT_LOCATOR_TYPE}"
            echo "Mutant: $CURRENT_MUTANT_NAME"
            echo "Test Result: $TEST_RESULT"
            if [ "$TEST_RESULT" = "failure" ]; then
                echo "Failure Cause: $FAILURE_CAUSE"
                echo "See $MAVEN_TEST_LOG for full details."
            fi
            echo "-------------------------------------"
        } >> "$RESULT_LOG"

        # 6. Ripristina il file originale
        cp "$BACKUP_FILE" "$DEST_FILE"
    done
done

# === PULIZIA FINALE ===
echo "====================================================="
echo "Terminazione dei processi..."

# Termina il processo di Angular
if [ ! -z "$NG_PID" ]; then
    kill $NG_PID
    wait $NG_PID 2>/dev/null
fi
echo "Applicazione Angular terminata."

# Rimuovi il file di backup
rm -f "$BACKUP_FILE"

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "=== PROCESSO DI TEST DI MUTAZIONE COMPLETATO ==="
echo "Tempo totale di esecuzione: ${DURATION} secondi."
echo "I risultati completi sono nel file CSV: $GLOBAL_CSV_FILE"
echo "Log dettagliati dei singoli test in: $RESULT_LOG"
echo "Screenshot dei fallimenti (se generati) in: $SCREENSHOT_DIR"
echo "Ultimo log di output di Maven è in: $MAVEN_TEST_LOG"
echo "====================================================="

# Opzionale: stampa a video un riassunto dei risultati dal CSV
echo "Riepilogo dei risultati:"
tail -n +2 "$GLOBAL_CSV_FILE" | cut -d, -f1,3 | sort | uniq -c

bash