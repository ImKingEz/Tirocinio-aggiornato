Comandi per la creazione automatica dei mutanti in maniera analitica:

1.
mvn clean install

2.
java -jar target/mutation-generator-1.0-SNAPSHOT.jar -f "C:\Users\WIN10\Desktop\Tirocinio-aggiornato\mutanti_paper_ed_utilities\script_paolella_volpe_mutants\UtilitiesForPaper\angular-example\frontend-example\src\app\contact-form\contact-form.component.html" -s "#name" -o "C:\Users\WIN10\Desktop\output_mutants"

-f: file su cui generare i mutanti
-s: selettore css del tag da mutare
-o: directory di output dei mutanti