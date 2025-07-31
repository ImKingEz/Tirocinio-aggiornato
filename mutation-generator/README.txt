PREREQUISITI:
maven v. 3.9.X, link -> https://dlcdn.apache.org/maven/maven-3/3.9.11/source/apache-maven-3.9.11-src.zip
java v. 17.0.5, link -> https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html


Comandi per la creazione automatica dei mutanti in maniera analitica:

1.
mvn clean install

2.
java -jar target/mutation-generator-1.0-SNAPSHOT.jar -f "path\al\file\da\mutare" -s "#selettore-css" -o "tuo\path\Tirocinio-aggiornato\mutanti_paper_ed_utilities\NOME-PROGETTO\mutantsToTest"

-f: file su cui generare i mutanti
-s: selettore css del tag da mutare
-o: directory di output dei mutanti