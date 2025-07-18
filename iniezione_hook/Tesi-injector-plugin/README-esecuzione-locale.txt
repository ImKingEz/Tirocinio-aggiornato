PASSAGGI PER ESEGUIRE Application.java IN LOCALE SU WINDOWS:
 1) Estrarre il contenuto del file test-hooks.zip
 2) Sostituire in Application.java la riga commmandList.add(0, ...) con commmandList.add(0, "cd path\\assoluto\\di\\test-guard")
 3) aprire il terminale nella cartella "Tesi-injector-plugin" poi eseguire i comandi:
   - mvn clean install
   - java -jar target\Tesi-injector-plugin-1.0-SNAPSHOT.jar ".html" "angularjs" "C:\\tuo\\path\\Tesi-StrumentoGenerale-master\\insert-here-your-web-app\\tua\\app"

MODIFICHE EFFETTUATE AL FILE Application.java:
 1) Aggiunta la funzionalità per prendere automaticamente il path assoluto di hookInjection.bat
 2) L'esecuzione dello script all'interno di "pb.command(...)" avviene tramite "cmd.exe /c hookInjection.bat" e non più con bash
 3) Modificato il metodo "createHookInjectionShContent" che ora è stato rinominato in "createHookInjectionContent" inserendo tra virgolette il percorso del file per gestire spazi o caratteri speciali