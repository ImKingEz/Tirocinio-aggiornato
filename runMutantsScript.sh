#!/bin/bash

# === CONFIGURAZIONE ===
echo "START"
CSV_DIR="$(pwd)/outputCsv"
mkdir -p "$CSV_DIR"

TODAY=$(date +"%d-%m-%Y")
NOW=$(date +"%H-%M")
TIMESTAMP="${TODAY}_${NOW}"
PROJECT_DIR="$(pwd)/UtilitiesForPaper/angular-example/frontend-example/src"
# Il backend Spring Boot non verrà avviato, ma il progetto Maven è ancora necessario per eseguire i test Selenium.
MAVEN_PROJECT_ROOT="$(pwd)/UtilitiesForPaper/angular-example"
LOG_DIR="$(pwd)/UtilitiesForPaper/logs"
LOG_FILE="$LOG_DIR/ng-serve-log.txt"
# Rimosso SPRING_LOG: non è più necessario in quanto non avviamo Spring Boot.
RESULT_LOG="$LOG_DIR/mutant_test_results.log"
MAVEN_TEST_LOG="$LOG_DIR/maven_test_output.log"
TESTNG_SUITES_DIR="$(pwd)/UtilitiesForPaper/testng_suites"

SOURCE_DIR="$(pwd)/UtilitiesForPaper/mutantsToTest"
DEST_FILE="$PROJECT_DIR/app/contact-form/contact-form.component.html"
BACKUP_FILE="/tmp/dest_backup.html" # Utilizzato per ripristinare lo stato iniziale di app.component.html

SCREENSHOT_DIR="$(pwd)/screenshots" # Nuova directory per gli screenshot
mkdir -p "$SCREENSHOT_DIR" # Crea la directory degli screenshot

mkdir -p "$LOG_DIR"
rm -f "$RESULT_LOG"
rm -f "$MAVEN_TEST_LOG"
# Rimuovi eventuali screenshot precedenti per evitare confusione
rm -rf "$SCREENSHOT_DIR"/*

# Array con i tipi di locator da testare
LOCATOR_TYPES=("hook" "absolute" "relative" "robula" "selenium" "katalon")

# Copia il file HTML originale nel backup prima di iniziare qualsiasi operazione
cp "$DEST_FILE" "$BACKUP_FILE"
pkill -f node || true # Assicurati che non ci siano processi node attivi

# Avvia Angular una sola volta per tutte le esecuzioni dei test
echo "Avvio Angular..."
cd "$PROJECT_DIR"
# Esegui npm install solo se node_modules non esiste (per velocizzare run successive se i layer Docker non cambiano)
if [ ! -d "node_modules" ]; then
    echo "Eseguo npm install per l'applicazione Angular..."
    npm install --silent
fi
rm -f "$LOG_FILE" # Pulisci il log precedente
(cd "$PROJECT_DIR" && ng serve --host 0.0.0.0 > "$LOG_FILE" 2>&1 &)

# Attesa avvio Angular
echo "Attesa avvio Angular..."
ANGULAR_INITIAL_TIMEOUT=180 # Aumentato timeout per maggiore robustezza all'avvio iniziale
ANGULAR_WAITED=0
until grep -q "Application bundle generation complete." "$LOG_FILE"; do
    sleep 2
    ANGULAR_WAITED=$((ANGULAR_WAITED + 2))
    if [ "$ANGULAR_WAITED" -ge "$ANGULAR_INITIAL_TIMEOUT" ]; then
        echo "❌ Timeout durante l'avvio iniziale di Angular."
        exit 1
    fi
done
echo "✅ Angular avviato."

# Inizializza il file CSV per i risultati globali
GLOBAL_CSV_FILE="$CSV_DIR/all_mutants_results_${TIMESTAMP}.csv"
echo "locator_type,mutant,result,failure_cause" > "$GLOBAL_CSV_FILE"

# Pre-installazione delle dipendenze Maven per il progetto dei test (una sola volta)
echo "Esecuzione mvn clean install -DskipTests per il progetto dei test..."
cd "$MAVEN_PROJECT_ROOT"
mvn clean install -DskipTests > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Errore durante mvn clean install del progetto dei test. Controlla il log."
    exit 1
fi
echo "✅ Dipendenze Maven per i test installate."


# Cicla su ogni tipo di locator
for CURRENT_LOCATOR_TYPE in "${LOCATOR_TYPES[@]}"; do
    echo "====================================================="
    echo "=== ESECUZIONE TEST CON LOCATOR: ${CURRENT_LOCATOR_TYPE} ==="
    echo "====================================================="

    CURRENT_TEST_SUITE_FILE="$TESTNG_SUITES_DIR/testng-${CURRENT_LOCATOR_TYPE}.xml"
    if [ ! -f "$CURRENT_TEST_SUITE_FILE" ]; then
        echo "Errore: File suite TestNG non trovato per ${CURRENT_LOCATOR_TYPE}: $CURRENT_TEST_SUITE_FILE"
        echo "${CURRENT_LOCATOR_TYPE},N/A,error,\"TestNG suite file not found\"" >> "$GLOBAL_CSV_FILE"
        continue
    fi

    # Ciclo sui mutanti
    for MUTANT_FILE in "$SOURCE_DIR"/*; do
        CURRENT_MUTANT="$MUTANT_FILE"
        CURRENT_NAME=$(basename "$MUTANT_FILE")
        echo "-------------------------------------"
        echo "Mutante processato: $CURRENT_MUTANT (Tipo Locator: ${CURRENT_LOCATOR_TYPE})"

        # Applica il mutante
        cp "$CURRENT_MUTANT" "$DEST_FILE"
        echo "=== CONTENUTO DI ${DEST_FILE} DOPO MUTAZIONE ==="
        cat "$DEST_FILE" # Stampa il contenuto dell'HTML mutato
        echo "-------------------------------------"

        # --- INIZIO NUOVA LOGICA: Attesa della ricompilazione Angular dopo mutazione ---
        echo "Mutante applicato. In attesa della ricompilazione di Angular..."

        # Pulisci il log di Angular per monitorare solo la nuova compilazione
        truncate -s 0 "$LOG_FILE"
        
        # Attendi un breve momento per dare a ng serve il tempo di iniziare a scrivere nel log dopo la modifica
        sleep 1 
        
        ANGULAR_RECOMPILE_TIMEOUT=20 # Timeout per la ricompilazione dopo una mutazione
        ANGULAR_RECOMPILE_WAITED=0
        RECOMPILE_SUCCESS=false

        # Monitora il log di Angular per il messaggio di compilazione completata
        # Nota: il messaggio esatto può variare, "Application bundle generation complete" o "Compiled successfully"
        while [ "$ANGULAR_RECOMPILE_WAITED" -lt "$ANGULAR_RECOMPILE_TIMEOUT" ]; do
            if grep -q -E "Application bundle generation complete|Compiled successfully" "$LOG_FILE"; then
                RECOMPILE_SUCCESS=true
                break
            fi
            sleep 2
            ANGULAR_RECOMPILE_WAITED=$((ANGULAR_RECOMPILE_WAITED + 2))
        done

        if [ "$RECOMPILE_SUCCESS" = true ]; then
            echo "✅ Angular ha ricompilato dopo la mutazione."
            # Aggiungi una piccola pausa extra per assicurare che il browser abbia avuto il tempo di ricaricare
            sleep 3
        else
            echo "❌ Timeout durante la ricompilazione di Angular dopo la mutazione. L'app potrebbe essere instabile."
            # Se Angular non ricompila, il test probabilmente fallirà con NoSuchElementException
            # Puoi scegliere di marcare questo come un fallimento di "ambiente" invece che di "mutante"
        fi
        # --- FINE NUOVA LOGICA ---

        cd "$MAVEN_PROJECT_ROOT" # Assicurati di essere nella root del progetto Maven per eseguire i test

        echo "Esecuzione test per il mutante: $CURRENT_NAME con locator ${CURRENT_LOCATOR_TYPE}"
        # Passo il percorso degli screenshot come system property a Maven/TestNG
        mvn test -Dtest.suite.file="$CURRENT_TEST_SUITE_FILE" -Dscreenshot.path="$SCREENSHOT_DIR" > "$MAVEN_TEST_LOG" 2>&1
        TEST_EXIT_CODE=$?

        TEST_RESULT="failure"
        FAILURE_CAUSE="Causa sconosciuta o generica. Controlla $MAVEN_TEST_LOG per i dettagli."

        if [ "$TEST_EXIT_CODE" -eq 0 ]; then
            TEST_RESULT="success"
            FAILURE_CAUSE="N/A"
        else
            # Analisi del log di Maven Test per determinare la causa
            if grep -q "org.openqa.selenium.NoSuchElementException" "$MAVEN_TEST_LOG"; then
                FAILURE_CAUSE="Selenium: NoSuchElementException - Elemento non trovato o XPath errato/mancante nel DOM."
            elif grep -q "org.openqa.selenium.ElementNotInteractableException" "$MAVEN_TEST_LOG"; then
                FAILURE_CAUSE="Selenium: ElementNotInteractableException - Elemento trovato ma non interagibile (es. disabilitato, nascosto, coperto)."
            elif grep -q "org.openqa.selenium.ElementClickInterceptedException" "$MAVEN_TEST_LOG"; then
                FAILURE_CAUSE="Selenium: ElementClickInterceptedException - Click intercettato da altro elemento (es. popup, overlay)."
            elif grep -q "org.openqa.selenium.TimeoutException" "$MAVEN_TEST_LOG"; then
                FAILURE_CAUSE="Selenium: TimeoutException - Elemento non trovato entro il timeout specificato."
            elif grep -q "java.lang.AssertionError" "$MAVEN_TEST_LOG"; then
                FAILURE_CAUSE="TestNG: AssertionError - Asserzione fallita nel test (il comportamento atteso non è stato riscontrato)."
            elif grep -q "java.lang.NullPointerException" "$MAVEN_TEST_LOG"; then
                FAILURE_CAUSE="Java: NullPointerException - Errore interno nel codice del test o dell'applicazione."
            elif grep -q "Could not start Chrome for testing" "$MAVEN_TEST_LOG"; then
                FAILURE_CAUSE="Selenium: Errore all'avvio di ChromeDriver. Controlla se Chrome e ChromeDriver sono compatibili."
            elif grep -q "org.testng.TestNGException" "$MAVEN_TEST_LOG"; then
                FAILURE_CAUSE="TestNG: Eccezione TestNG (es. classe non trovata, configurazione errata della suite)."
            else # Aggiunta una causa generica per fallimenti non specifici
                 FAILURE_CAUSE="Maven Test Fallito. Controlla il log per altri dettagli."
            fi
        fi

        echo "Risultato Test (${CURRENT_LOCATOR_TYPE}): $TEST_RESULT"
        echo "${CURRENT_LOCATOR_TYPE},${CURRENT_NAME},${TEST_RESULT},\"${FAILURE_CAUSE}\"" >> "$GLOBAL_CSV_FILE"
        {
            echo "Tipo Locator: ${CURRENT_LOCATOR_TYPE}"
            echo "Mutante: $CURRENT_MUTANT"
            echo "Risultato Test: $TEST_RESULT"
            if [ "$TEST_RESULT" = "failure" ]; then
                echo "Causa Fallimento: $FAILURE_CAUSE"
                echo "Per dettagli: controlla $MAVEN_TEST_LOG"
            fi
            echo "-------------------------------------"
        } >> "$RESULT_LOG"

        cp "$BACKUP_FILE" "$DEST_FILE" # Ripristina il file originale HTML
    done

done

# Termina Angular alla fine di tutto
echo "Terminazione Angular..."
pkill -f node || true

rm -f "$BACKUP_FILE"
echo "=== TUTTI I MUTANTI PROCESSATI PER TUTTI I TIPI DI LOCATOR ==="
echo "I risultati sono in $GLOBAL_CSV_FILE"
echo "Log dettagliati in $RESULT_LOG e $MAVEN_TEST_LOG"
echo "Screenshot (se generati) in $SCREENSHOT_DIR"

cd "/script_paolella_volpe_mutants/UtilitiesForPaper/logs"
cat "mutant_test_results.log"

bash