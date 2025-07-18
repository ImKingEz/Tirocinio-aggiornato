============================================================
                      README TECNICO
============================================================

DESCRIZIONE GENERALE:
------------------------------------------------------------
L'APPLICAZIONE UTILIZZA UNO SCRIPT DI NOME `goldScript.bat` PER
AUTOMATIZZARE IL TESTING DI MUTANTI HTML.

QUESTO SCRIPT LAVORA ALL’INTERNO DELL’APPLICAZIONE DI ESEMPIO
"angular-java-example", PRESENTE NELLA CARTELLA `UtilitiesForPaper`.

L'OBIETTIVO È SOSTITUIRE DINAMICAMENTE IL CODICE HTML DEL COMPONENTE
`app.component.html` CON DIVERSE VERSIONI (I MUTANTI), E TESTARLE
TRAMITE SELENIUM PER CAPIRE SE TALI MUTAZIONI DISTRUGGONO L'ESECUZIONE.

------------------------------------------------------------

ATTENZIONE, PRIMA DI CONTINUARE, INSTALLARE NVM TRAMITE IL FILE 
.EXE PRESENTE NELLA CARTELLA DI UTILITIES.

============================================================
STEP 1:
------------------------------------------------------------
ESEGUIRE LO SCRIPT `goldScript.bat` DAL TERMINALE (CMD CONSIGLIATO).

LO SCRIPT AUTOMATIZZA LE SEGUENTI OPERAZIONI:

- PREPARAZIONE DELL’AMBIENTE DI TEST
- INSTALLAZIONE AUTOMATICA DEI TOOL E DELLE VERSIONI CORRETTE
- AVVIO DELL’APPLICAZIONE DI ESEMPIO (ANGULAR E JAVA)
- ESECUZIONE DEI TEST AUTOMATICI SUI MUTANTI HTML

È POSSIBILE LANCIARE LO SCRIPT ANCHE CON DOPPIO CLICK,
MA L’UTILIZZO DA TERMINALE È CONSIGLIATO PER UNA
MIGLIORE LETTURA DEI LOG.

============================================================
STEP 2:
------------------------------------------------------------
AL TERMINE DELLO SCRIPT, PREMERE DUE VOLTE UN TASTO QUALSIASI
COME RICHIESTO DA TERMINALE PER COMPLETARE LA PULIZIA DEI PROCESSI.

SE QUESTO PASSAGGIO VIENE SALTATO, I PROCESSI VERRANNO
COMUNQUE TERMINATI AUTOMATICAMENTE AL PROSSIMO AVVIO.

============================================================
STEP 3 (USO MANUALE DELL’APPLICAZIONE):
------------------------------------------------------------
DOPO AVER ESEGUITO UNA PRIMA VOLTA `goldScript.bat`,
È POSSIBILE AVVIARE MANUALMENTE L’APPLICAZIONE DI ESEMPIO:

FRONTEND (ANGULAR):
    ESEGUIRE IL COMANDO `set "NODE_OPTIONS=--openssl-legacy-provider" && ng serve` NEL SEGUENTE PERCORSO:

    C:\PROPRIO-PATH\Progetto_Software_Testing_Fabio_Bandiera\
    script_Bandiera_Mutants\UtilitiesForPaper\angular-java-example\
    src\main\ui\src

BACKEND (SPRING BOOT):
    ESEGUIRE IL COMANDO `mvn clean install -DskipTests && mvn spring-boot:run -DskipTests` NEL PERCORSO:

    C:\PROPRIO-PATH\Progetto_Software_Testing_Fabio_Bandiera\
    script_Bandiera_Mutants\UtilitiesForPaper\angular-java-example

QUESTO PUÒ ESSERE UTILE PER TESTARE O MODIFICARE L’APPLICAZIONE
FUORI DALLO SCRIPT AUTOMATICO.

============================================================
GESTIONE DEI MUTANTI:
------------------------------------------------------------
ALL’INTERNO DELLA CARTELLA `UtilitiesForPaper` È PRESENTE
UNA CARTELLA CHIAMATA `mutants`.

IN QUESTA CARTELLA PUOI:

- INSERIRE ALTRI FILE HTML MUTATI DEL COMPONENTE ORIGINALE
- MODIFICARE QUELLI GIÀ PRESENTI
- GESTIRE IL NUMERO E LA VARIETÀ DI MUTANTI DA TESTARE

UTILIZZO TIPICO:

1. GENERARE O OTTENERE MUTAZIONI HTML DEL COMPONENTE
2. INSERIRLE NELLA CARTELLA `mutants`
3. AVVIARE `goldScript.bat` PER TESTARLE AUTOMATICAMENTE

============================================================
LOG E RISULTATI:
------------------------------------------------------------

LOG DETTAGLIATI:
    UtilitiesForPaper/logs/mutants_test_results.log

    - CONTIENE I RISULTATI DEI TEST SUI MUTANTI, IDENTIFICATI PER
      NOME DEL FILE HTML

RISULTATI CSV:
    UtilitiesForPaper/outputCsv/

    - CONTIENE UN FILE CSV PER OGNI ESECUZIONE
    - OGNI CSV INCLUDE:
        1. NOME DEL MUTANTE
        2. RISULTATO DEL TEST (SUCCESSO / FALLIMENTO)

DIAGRAMMI:
    UtilitiesForPaper/diagrammi/

    - DIAGRAMMA PNG: VISUALIZZA IL FUNZIONAMENTO DEL SISTEMA
    - DIAGRAMMA TESTUALE: DESCRIVE IL FLOW LOGICO DEI TEST

============================================================
NOTE SUL CHROMEDRIVER:
------------------------------------------------------------

IN CASO DI MALFUNZIONAMENTI RELATIVI AL CHROMEDRIVER,
È POSSIBILE SOSTITUIRE IL FILE `chromedriver.exe` PRESENTE NELLA
CARTELLA `utility` CON UNA VERSIONE:

- PIÙ RECENTE
- O COMPATIBILE CON LA VERSIONE INSTALLATA DI GOOGLE CHROME

VERSIONE ATTUALE: 135

============================================================

DI SEGUITO, UN FLOW CHART TESTUALE DI COME FUNZIONA LO SCRIPT:

          INIZIO
			|
			v
		📁 Crea cartelle output/logs
			|
			v
		🕒 Genera timestamp univoco per il CSV
			|
			v
		📋 Prepara log e file HTML originale (backup)
			|
			v
		🔒 Chiude eventuali processi Angular attivi
			|
			v
		💻 Verifica e imposta NVM, NODE, e NPM:
			├── 1️⃣ Verifica NVM
			├── 2️⃣ Imposta versione NODE 10.24.1
			├── 3️⃣ Forza aggiornamento PATH
			├── 4️⃣ Verifica versione NODE
			├── 5️⃣ Verifica e installa NPM 6.14.12
			├── 6️⃣ Installa Angular CLI versione 7.3.10
			└── 7️⃣ Verifica versione Angular CLI
			|
			v
		🧹 Esegue npm install nel frontend Angular
			|
			v
		🚀 Avvia Angular in background (headless)
			|
			v
		⏳ Aspetta che Angular sia completamente avviato
			|
			v
		🔁 Per ogni file mutante HTML:
			├── 1️⃣ Copia mutante nel componente HTML
			├── 2️⃣ Avvia Spring Boot (in background)
			├── 3️⃣ Attende che Spring Boot sia avviato
			├── 4️⃣ Esegue i test (mvn test)
			├── 5️⃣ Se "BUILD SUCCESS":
			│       └── ✅ Scrive SUCCESS in log e CSV
			├── 6️⃣ Altrimenti:
			│       └── ❌ Scrive FAILURE in log e CSV
			├── 7️⃣ Termina Spring Boot (kill java.exe)
			└── 8️⃣ Ripristina file HTML originale
			|
			v
		🏁 Dopo l'ultimo mutante:
			├── ❌ Termina Angular (kill node.exe)
			└── 🧽 Pulisce il file backup
			|
			v
		FINE SCRIPT

