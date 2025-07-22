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

Tirocinio-aggiornato/
│
├── mutanti_paper_ed_utilities/
│   │
│   └── NOME_PROGETTO_VARIABILE/  <-- CARTELLA VARIABILE
│       │                           (Es. "angular-example-no-id", "my-project-v1")
│       ├── frontend/     	   <-- CARTELLA FISSA (L'applicazione Angular)
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
└── runMutantsScript.sh           <-- Lo script bash che orchestra l'esecuzio

--------------------------------------------------------------
2. Costruzione ed Esecuzione dell'Immagine Docker
--------------------------------------------------------------

Assicurati di essere nella directory radice (`Tirocinio-aggiornato`) quando esegui questi comandi.

2.1. Costruire l'Immagine Docker

Usa il flag `--build-arg` per specificare il nome della cartella del tuo progetto.
Sostituisci `angular-example-no-id` con il nome effettivo della tua cartella.


docker build --build-arg PROJECT_DIR_NAME=angular-example-no-id -t mutant-tester .

2.2. Eseguire il Container Docker (Windows Powershell)

Per eseguire i test, devi specificare il percorso del file HTML da mutare (relativo alla directory `frontend`) e mappare le directory di output per salvare i risultati.

# 1. (Opzionale ma consigliato) Crea le directory di output sulla tua macchina host
mkdir -p output_csv output_logs output_screenshots

# 2. Esegui il container
docker run `
  -e TARGET_FILE="src/app/contact-form/contact-form.component.html" `
  -v "${PWD}\output_csv:/app/output_csv" `
  -v "${PWD}\output_logs:/app/output_logs" `
  -v "${PWD}\output_screenshots:/app/output_screenshots" `
  mutant-tester


Output dei risultati:
Dopo l'esecuzione, troverai i risultati, i log e gli screenshot nelle directory `output_csv`, `output_logs` e `output_screenshots` nella tua cartella radice.

- outputCsv/mutants_results_<timestamp>.csv
  Contiene per ogni mutante il nome file e il risultato del test (success, failure o timeout).

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