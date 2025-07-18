Mutant Testing Automation - Angular & Spring Boot
=================================================

Questo progetto automatizza l'esecuzione di test su una serie di "mutanti" HTML 
all'interno di un'app Angular integrata con Spring Boot. Lo script esegue test 
end-to-end e raccoglie i risultati in un file di log.

-------------------------------------------------
Esecuzione tramite Docker
-------------------------------------------------

Per eseguire l'automazione all'interno di un container Docker:

1. Costruire l'immagine Docker:

   docker build -t mutanti-docker .

2. Eseguire l'immagine in modalità interattiva:

   docker run -it mutanti-docker /bin/bash

Alla fine dell'esecuzione, il container rimarrà attivo in modalità interattiva e sarà possibile consultare i file di log generati.

-------------------------------------------------
Funzionalità dello script run_tests.sh
-------------------------------------------------

1. Configurazione iniziale

   - Definizione delle cartelle di output per i log.
   - Impostazione dei percorsi relativi al progetto Angular e Spring Boot.
   - Backup del file HTML originale.

2. Avvio dei servizi

   - Compilazione dell'applicazione Spring Boot (con skip dei test).
   - Avvio del server Angular in background con "ng serve".
   - Attesa che Angular sia completamente avviato (fino a 60 secondi).

3. Elaborazione dei mutanti

   Per ogni file presente nella cartella "mutantsToTest":
   - Copia del contenuto nel file "app.component.html".
   - Compilazione Spring Boot.
   - Avvio Spring Boot in background con log salvato su file.
   - Attesa che il server sia avviato (fino a 60 secondi).
   - Esecuzione dei test tramite "mvn test".
   - Scrittura del risultato nel file CSV e nel log dettagliato.
   - Terminazione del processo Spring Boot in modo sicuro.
   - Ripristino del file HTML originale.

4. Pulizia finale

   - Rimozione del file di backup.
   - Terminazione dei processi Angular.
   - Apertura automatica della shell nel container per consultare i log.

-------------------------------------------------
Output generato
-------------------------------------------------

- outputCsv/mutants_results_<timestamp>.csv
  Contiene per ogni mutante il nome file e il risultato del test (success, failure o timeout).

- logs/mutant_test_results.log
  Contiene log dettagliati del test per ciascun mutante.

- logs/ng-serve-log.txt
  Log del server Angular.

- logs/spring-boot-log.txt
  Log del server Spring Boot.

-------------------------------------------------
Struttura attesa del progetto
-------------------------------------------------

UtilitiesForPaper/
├── angular-java-example/
│   └── src/main/ui/src/app/app.component.html
├── mutantsToTest/
│   ├── mutante1.html
│   ├── mutante2.html
├── logs/ (creata automaticamente)
├── outputCsv/ (creata automaticamente)

-------------------------------------------------
Requisiti per il container
-------------------------------------------------

Il contenitore Docker deve includere:

- Node.js e npm
- Java (JDK)
- Maven
- Chrome o Chromium per l'esecuzione dei test E2E, se previsti
- Tutte le dipendenze specificate dal progetto Angular e Spring Boot

-------------------------------------------------
Note aggiuntive
-------------------------------------------------

- Lo script è progettato per essere eseguito in ambienti Unix/Linux.
- Su sistemi Windows, evitare che file o cartelle del progetto siano aperti da altri programmi durante l'esecuzione.
