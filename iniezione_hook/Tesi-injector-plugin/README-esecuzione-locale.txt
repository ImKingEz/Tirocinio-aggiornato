PASSAGGI PER ESEGUIRE Application.java IN LOCALE SU WINDOWS:
 1) Estrarre il contenuto del file test-hooks.zip
 2) Scaricare Build Tools per Visual Studio 2022 dal link : https://aka.ms/vs/17/release/vs_BuildTools.exe
 3) Aprire il terminale nella cartella "test-guard" ed eseguire il comando : "npm install"
 4) Sostituire in Application.java la riga commmandList.add(0, ...) con commmandList.add(0, "cd path\\assoluto\\di\\test-guard")
 5) aprire il terminale nella cartella "Tesi-injector-plugin" poi eseguire i comandi:
   - mvn clean install
   - java -jar target\Tesi-injector-plugin-1.0-SNAPSHOT.jar ".html" "angularjs" "C:\\tuo\\path\\Tesi-StrumentoGenerale-master\\insert-here-your-web-app\\tua\\app"