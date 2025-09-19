==============================================================
Setup del Progetto per i Test di Mutazione UI con Docker
==============================================================

Questo documento descrive la struttura delle cartelle attesa per il progetto,
il Dockerfile, lo script di esecuzione e i comandi per costruire ed eseguire
i test di mutazione UI.

--------------------------------------------------------------
1. Struttura delle Cartelle del Progetto
--------------------------------------------------------------

La struttura delle cartelle locale (sulla tua macchina host) deve essere la seguente:
*** Ricorda che il progetto deve usare Angular 19 !!! ***

Tirocinio-aggiornato/
│
├── progetti-per-test/
│   │
│   └── NOME_PROGETTO_VARIABILE/  <-- CARTELLA VARIABILE
│       │                           (Es. "angular-example-no-id", "my-project-v1")
│       ├── frontend/     	       <-- CARTELLA FISSA (L'applicazione Angular 19)
│       │   ├── src/
│       │   └── ...
│       │
│       ├── selenium-tests/       <-- CARTELLA FISSA (Il progetto Maven per i test UI)
│       │   ├── src/
│       │   └── pom.xml
│       │
│       ├── mutantsToTest/        <-- CARTELLA FISSA (I file HTML mutati)
│       │   └── ...
│       │
│       └── testng_suites/        <-- CARTELLA FISSA (Le suite TestNG XML)
│           └── ...
│
├── Dockerfile                    <-- Il file Dockerfile per costruire l'immagine
│
└── runMutantsScript.sh           <-- Lo script bash che orchestra l'esecuzione

--------------------------------------------------------------
2. Costruzione ed Esecuzione dell'Immagine Docker
--------------------------------------------------------------

Assicurati di essere nella directory radice (`Tirocinio-aggiornato`) quando esegui questi comandi.

2.1. Costruire l'Immagine Docker

Usa il flag `--build-arg` per specificare il nome della cartella del tuo progetto.
Sostituisci `NOME_PROGETTO_VARIABILE` con il nome effettivo della tua cartella.

docker build `
  --build-arg PROJECT_DIR_NAME=NOME_PROGETTO_VARIABILE `
  --build-arg CACHE_BUSTER=$(Get-Date -UFormat %s) `
  -t mutant-tester .

2.2. Eseguire il Container Docker (Windows Powershell)

Per eseguire i test, devi specificare il percorso del file HTML da mutare (relativo alla directory `frontend`) e mappare le directory di output per salvare i risultati.

# 1. (Opzionale ma consigliato) Crea le directory di output sulla tua macchina host
New-Item -Path 'output_csv', 'output_logs', 'output_screenshots' -ItemType Directory -Force

# 2. Esegui il container
docker run `
  -e TARGET_FILE="src/app/path/del/file/da/mutare/file.html" `
  -v "${PWD}\output_csv:/app/output_csv" `
  -v "${PWD}\output_logs:/app/output_logs" `
  -v "${PWD}\output_screenshots:/app/output_screenshots" `
  mutant-tester


Output dei risultati:
Dopo l'esecuzione, troverai i risultati, i log e gli screenshot nelle directory `output_csv`, `output_logs` e `output_screenshots` nella tua cartella radice.

- outputCsv/mutants_results_<timestamp>.csv
  Contiene per ogni mutante il nome file e il risultato del test (success, failure o timeout) con il locatore che si è rotto nel caso in cui il test sia fallito.

- outputCsv/summary_results_<timestamp>.csv
  Contiene per ogni locatore quanti test sono stati effettuati e quanti sono falliti (per obsolescenza e non).

- logs/mutant_test_results.log
  Contiene log dettagliati del test per ciascun mutante.

- logs/ng-serve-log.txt
  Log del server Angular.

--------------------------------------------------------------
3. Debugging
--------------------------------------------------------------

Per accedere a una shell interattiva all'interno del container:

docker run -it --rm --entrypoint /bin/bash mutant-tester

Da qui puoi esplorare il filesystem del container in `/app` per verificare che tutti i file siano stati copiati correttamente.