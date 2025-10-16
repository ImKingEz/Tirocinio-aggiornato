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
#    d. Registra il risultato (success/failure), la causa e il locator fallito.
#    e. Ripristina il file sorgente originale.
# 5. Produce un file CSV completo con tutti i risultati.
# 6. Produce un file CSV di riepilogo con le statistiche aggregate.
#

# === CONFIGURAZIONE ===
echo "=== INIZIO PROCESSO DI TEST DI MUTAZIONE ==="
START_TIME=$(date +%s)

# --- PERCORSI FISSI E ROBUSTI ALL'INTERNO DEL CONTAINER ---
SCRIPT_ROOT_DIR=$(pwd)
APP_ROOT_DIR="${SCRIPT_ROOT_DIR}/frontend"
MAVEN_PROJECT_ROOT="${SCRIPT_ROOT_DIR}/selenium-tests"
TESTNG_SUITES_DIR="${SCRIPT_ROOT_DIR}/testng_suites"
SOURCE_DIR="${SCRIPT_ROOT_DIR}/mutantsToTest"

# --- DIRECTORY DI OUTPUT ---
LOG_DIR="${SCRIPT_ROOT_DIR}/output_logs"
CSV_DIR="${SCRIPT_ROOT_DIR}/output_csv"
SCREENSHOT_DIR="${SCRIPT_ROOT_DIR}/output_screenshots"
DOM_DIR="${SCRIPT_ROOT_DIR}/output_dom"

mkdir -p "$LOG_DIR" "$CSV_DIR" "$SCREENSHOT_DIR" "$DOM_DIR"
echo "Directory di output preparate."

# --- FILE DI LOG E RISULTATI ---
TIMESTAMP=$(date +"%d-%m-%Y_%H-%M-%S")
LOG_FILE="${LOG_DIR}/ng-serve.log"
RECOMPILATION_LOG="${LOG_DIR}/recompilation_debug_${TIMESTAMP}.log"
RESULT_LOG="${LOG_DIR}/mutant_test_results_${TIMESTAMP}.log"
MAVEN_TEST_LOG="${LOG_DIR}/maven_test_output.log"
GLOBAL_CSV_FILE="${CSV_DIR}/all_mutants_results_${TIMESTAMP}.csv"
SUMMARY_CSV_FILE="${CSV_DIR}/summary_results_${TIMESTAMP}.csv"

# --- CONFIGURAZIONE TEST (FILE TARGET DINAMICO) ---
if [ -z "$TARGET_FILE" ]; then
    echo "❌ Errore Critico: La variabile d'ambiente TARGET_FILE non è stata impostata." >&2
    echo "   Usa il flag '-e TARGET_FILE=\"percorso/relativo/al/file.html\"' nel comando docker run." >&2
    exit 1
fi
DEST_FILE="${APP_ROOT_DIR}/${TARGET_FILE}"
TARGET_FILENAME=$(basename "$TARGET_FILE")
BACKUP_FILE="/tmp/backup_${TARGET_FILENAME}"
echo "File target per la mutazione: $DEST_FILE"
if [ ! -f "$DEST_FILE" ]; then
    echo "❌ Errore Critico: Il file target specificato non esiste nel percorso: $DEST_FILE" >&2
    exit 1
fi

LOCATOR_TYPES=("hook" "absolute" "relative" "robula" "robulaplus" "selenium" "katalon")

# Pulizia di esecuzioni precedenti
echo "Pulizia di log e screenshot di esecuzioni precedenti..."
rm -f "$LOG_DIR"/*_results_*.log "$LOG_DIR"/*.log
rm -rf "$SCREENSHOT_DIR"/*
rm -rf "$DOM_DIR"/*

# === PREPARAZIONE AMBIENTE ===
echo "Creazione backup del file HTML originale..."
cp "$DEST_FILE" "$BACKUP_FILE"
echo "Installazione delle dipendenze Maven..."
cd "$MAVEN_PROJECT_ROOT"
mvn clean install -DskipTests > "${LOG_DIR}/maven_initial_setup.log" 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Errore critico durante 'mvn clean install'. Controllare il file '${LOG_DIR}/maven_initial_setup.log'."
    exit 1
fi
echo "✅ Dipendenze Maven installate."
echo "Avvio dell'applicazione Angular con --poll..."
cd "$APP_ROOT_DIR"
if [ ! -d "node_modules" ]; then
    echo "Esecuzione 'npm install' per l'applicazione Angular..."
    npm install --silent
fi
mkdir -p "$LOG_DIR"
(ng serve --host 0.0.0.0 --poll=500 --no-hmr > "$LOG_FILE" 2>&1 &)
NG_PID=$!

echo "In attesa che il file di log di Angular sia creato ($LOG_FILE)..."
MAX_WAIT_FOR_LOG_FILE=15
SECONDS_WAITED=0
while [ ! -f "$LOG_FILE" ] && [ $SECONDS_WAITED -lt $MAX_WAIT_FOR_LOG_FILE ]; do
    sleep 1
    SECONDS_WAITED=$((SECONDS_WAITED + 1))
done

if [ ! -f "$LOG_FILE" ]; then
    echo "❌ Errore critico: Il file di log di Angular non è stato creato entro $MAX_WAIT_FOR_LOG_FILE secondi."
    if [ ! -z "$NG_PID" ]; then kill $NG_PID; fi
    exit 1
fi

echo "In attesa che l'applicazione Angular si avvii (max 30s)..."
if ! timeout 30 grep -q -E "Compiled successfully|Application bundle generation complete" <(tail -f "$LOG_FILE"); then
    echo "❌ Timeout durante l'avvio iniziale di Angular. Lo script verrà interrotto."
    cat "$LOG_FILE"
    if [ ! -z "$NG_PID" ]; then kill $NG_PID; fi
    exit 1
fi
echo "✅ Applicazione Angular avviata con successo."
sleep 2 

# === ESECUZIONE CICLO DI TEST ===
echo "locator_type;mutant;result;failure_cause;failed_locator" > "$GLOBAL_CSV_FILE"
echo "Inizio del ciclo di test sui mutanti..."

for CURRENT_LOCATOR_TYPE in "${LOCATOR_TYPES[@]}"; do
    echo "====================================================="
    echo "=== ESECUZIONE TEST CON LOCATOR: ${CURRENT_LOCATOR_TYPE} ==="
    echo "====================================================="
    CURRENT_TEST_SUITE_FILE="${TESTNG_SUITES_DIR}/testng-${CURRENT_LOCATOR_TYPE}.xml"
    if [ ! -f "$CURRENT_TEST_SUITE_FILE" ]; then
        echo "⚠️  Attenzione: File suite TestNG non trovato. Salto questo locator."
        echo "${CURRENT_LOCATOR_TYPE};N/A;error;\"TestNG suite file not found\";\"N/A\"" >> "$GLOBAL_CSV_FILE"
        continue
    fi

    for MUTANT_FILE in "$SOURCE_DIR"/*; do
        CURRENT_MUTANT_NAME=$(basename "$MUTANT_FILE")
        echo "-------------------------------------"
        echo "Processing Mutant: $CURRENT_MUTANT_NAME (Locator Type: $CURRENT_LOCATOR_TYPE)"

        cp "$MUTANT_FILE" "$DEST_FILE"
        echo "Mutante applicato. In attesa della ricompilazione di Angular (max 15s)..."
        
        RECOMPILE_STATUS="timeout"
        SECONDS=0
        TIMEOUT=15
        LAST_LOG_LINE=$(wc -l < "$LOG_FILE")
        
        echo "--- Debug Recompilation for: $CURRENT_MUTANT_NAME ---" >> "$RECOMPILATION_LOG"
        
        while [ $SECONDS -lt $TIMEOUT ]; do
            NEW_LOG_OUTPUT=$(tail -n +$((LAST_LOG_LINE + 1)) "$LOG_FILE")
            
            if echo "$NEW_LOG_OUTPUT" | grep -q -E "Compiled successfully|Application bundle generation complete"; then
                RECOMPILE_STATUS="success"
                echo "$NEW_LOG_OUTPUT" >> "$RECOMPILATION_LOG"
                break
            elif echo "$NEW_LOG_OUTPUT" | grep -q -E "Error:|ERROR in"; then
                RECOMPILE_STATUS="failure"
                echo "$NEW_LOG_OUTPUT" >> "$RECOMPILATION_LOG"
                break
            fi
            sleep 1
            SECONDS=$((SECONDS + 1))
        done
        echo "--- End Debug for: $CURRENT_MUTANT_NAME ---" >> "$RECOMPILATION_LOG"


        if [ "$RECOMPILE_STATUS" = "success" ]; then
            echo "✅ Angular ha ricompilato con successo."
            sleep 2
            
            cd "$MAVEN_PROJECT_ROOT"
            echo "Esecuzione test Maven..."
            mvn clean test \
              -Dtest.suite.file="$CURRENT_TEST_SUITE_FILE" \
              -Dlocator.type="$CURRENT_LOCATOR_TYPE" \
              -Dmutant.name="$CURRENT_MUTANT_NAME" \
              -Dscreenshot.path="$SCREENSHOT_DIR" \
              -Ddom.path="$DOM_DIR" > "$MAVEN_TEST_LOG" 2>&1
            TEST_EXIT_CODE=$?

                        if [ "$TEST_EXIT_CODE" -eq 0 ]; then
                # Caso di successo: il test è passato
                TEST_RESULT="success"
                FAILURE_CAUSE="N/A"
                FAILED_LOCATOR="N/A"
            else
                # Caso di fallimento: il test non è passato
                TEST_RESULT="failure"
                
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

                LOCATOR_INFO=$(grep -m 1 -o -E 'Unable to locate element: \{.*\}|located by: [^)]+' "$MAVEN_TEST_LOG")
                
                if [ -n "$LOCATOR_INFO" ]; then
                    FAILED_LOCATOR=$(echo "$LOCATOR_INFO" | sed -e 's/Unable to locate element: //' -e 's/.*located by: //')
                else
                    FAILED_LOCATOR="N/A (not found in log)"
                fi
            fi

        elif [ "$RECOMPILE_STATUS" = "failure" ]; then
            echo "❌ Angular non è riuscito a compilare il mutante. Test saltato."
            TEST_RESULT="error"; FAILURE_CAUSE="Angular Compilation Failed"; FAILED_LOCATOR="N/A"
        
        else # timeout
            echo "❌ Timeout durante la ricompilazione di Angular. Test saltato."
            TEST_RESULT="error"; FAILURE_CAUSE="Angular Recompilation Timeout"; FAILED_LOCATOR="N/A"
        fi

        echo "Risultato: $TEST_RESULT"
        echo "${CURRENT_LOCATOR_TYPE};${CURRENT_MUTANT_NAME};${TEST_RESULT};\"${FAILURE_CAUSE}\";\"${FAILED_LOCATOR}\"" >> "$GLOBAL_CSV_FILE"
        cp "$BACKUP_FILE" "$DEST_FILE"
        sleep 1 
    done
done

# === PULIZIA FINALE E REPORT ===
echo "====================================================="
echo "Terminazione dei processi..."
if [ ! -z "$NG_PID" ]; then
    kill $NG_PID
    wait $NG_PID 2>/dev/null
fi
echo "Applicazione Angular terminata."
rm -f "$BACKUP_FILE"
echo "Generazione del report di riepilogo..."
echo "Tipo Locatore;Totale Test;Test con successo;Fallimenti per Fragilità;Fallimenti per Obsolescenza" > "$SUMMARY_CSV_FILE"
NUM_LOCATOR_TYPES=${#LOCATOR_TYPES[@]}
OBSOLESCENCE_FAILURES_COUNT=$(grep -E ';(failure|error);' "$GLOBAL_CSV_FILE" | cut -d';' -f2 | sort | uniq -c | awk -v n=$NUM_LOCATOR_TYPES '$1==n {c++} END {print c+0}')
for type in "${LOCATOR_TYPES[@]}"; do
    if ! grep -q "^${type};" "$GLOBAL_CSV_FILE"; then continue; fi
    TOTAL_TESTS=$(grep -c "^${type};" "$GLOBAL_CSV_FILE")
    SUCCESSFUL_TESTS=$(grep -c "^${type};.*;success;" "$GLOBAL_CSV_FILE")
    TOTAL_FAILURES=$((TOTAL_TESTS - SUCCESSFUL_TESTS))
    FRAGILITY_FAILURES=$((TOTAL_FAILURES - OBSOLESCENCE_FAILURES_COUNT))
    echo "${type};${TOTAL_TESTS};${SUCCESSFUL_TESTS};${FRAGILITY_FAILURES};${OBSOLESCENCE_FAILURES_COUNT}" >> "$SUMMARY_CSV_FILE"
done
echo "✅ Report di riepilogo generato."
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
echo ""
echo "=== PROCESSO DI TEST DI MUTAZIONE COMPLETATO ==="
echo "Tempo totale di esecuzione: ${DURATION} secondi."
echo ""
echo "--- File di Output Generati ---"
echo "Risultati completi: $GLOBAL_CSV_FILE"
echo "Riepologo risultati:  $SUMMARY_CSV_FILE"
echo "Log dettagliati:    $RESULT_LOG"
echo "Log di ricompilazione: $RECOMPILATION_LOG"
echo "Screenshot (tutti): $SCREENSHOT_DIR/"
echo "Dump del DOM:       $DOM_DIR/"
echo ""
echo "================= RIEPILOGO FINALE DEI RISULTATI ================="
if command -v column &> /dev/null; then
    column -s';' -t < "$SUMMARY_CSV_FILE"
else
    cat "$SUMMARY_CSV_FILE"
fi
echo "=================================================================="
echo ""