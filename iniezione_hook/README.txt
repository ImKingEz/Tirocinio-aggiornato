### Prerequisiti
Build Tools per Visual Studio 2022 : https://aka.ms/vs/17/release/vs_BuildTools.exe
Maven v. 3.9.X, link -> https://dlcdn.apache.org/maven/maven-3/3.9.11/source/apache-maven-3.9.11-src.zip
Java v. 17.0.5, link -> https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html

PASSAGGI PER ESEGUIRE Application.java IN LOCALE SU WINDOWS:
 1) Aprire il terminale nella cartella "test-hook/test-guard" ed eseguire il comando : "npm install"
 2) Aprire il terminale nella cartella "Tesi-injector-plugin" poi eseguire i comandi:
   - mvn clean install
   - java -jar target\Tesi-injector-plugin-1.0-SNAPSHOT.jar ".html" "angularjs" "C:\\path\\del\\tuo\\progetto\\src"