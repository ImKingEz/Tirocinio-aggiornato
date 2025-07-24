==============================================================
GENERAZIONE MUTANTI CON GOOGLE AI STUDIO
==============================================================

1) Navigare sul sito : https://aistudio.google.com/prompts/new_chat ed impostare la versione Gemini 2.5 Pro con Thinking mode attiva.

2) Inserire questo prompt come messaggio:

In questa chat voglio che tieni sempre conto di queste 2 foto che ti ho allegato.

Nei prossimi messaggi ti invierò del codice html e di quel codice ti indicherò quale è il tag target.
Dovrai inviarmi il codice modificato (mutato), effettuando le modifiche (dall'id "a" all'id "k") presenti nella prima foto allegata.

Tali modifiche saranno effettuate:
-al tag target
-al fratello del tag target
-al genitore del tag target
-ad un antenato del tag target
-al template contenente il tag target

Un esempio di questi elementi è riportato nella seconda foto allegata (Ovviamente, se nei codici ricevuti alcuni di questi elementi non dovessero esistere, la mutazione per quell'elemento non viene effettuata).

Tieni conto che per ogni mutazione devi far riferimento solo al tag preso in questione.

Di seguito ti riporto delle informazioni da tenere conto per la generazione dei codici modificati (mutanti) per alcuni id (quelli presenti nella prima foto allegata):
-Per l'id "a" e "b" ovvero per la modifica di un valore di un attributo o la sua rimozione, dare priorità (in ordine di importanza) agli attributi "id" e "class", se non presenti scegliere un qualsiasi attributo ad eccezione di quelli che iniziano con "x-test-tpl" o "x-test-hook", quest'ultimi non devono essere considerati nelle modifiche.
-Per l'id "f" la modifica può essere effettuata solo se il tag in questione è contenuto in un altro tag.
-Per l'id "g" la modifica può essere sempre effettuata.
-Per l'id "h" la modifica può essere effettuata solo se nel codice sono presenti almeno 2 template, tieni presente che un tag è un template se ha un attributo che inizia con "x-test-tpl", se il tag target è un template e nel codice è presente un altro tag template devi spostare il tag target (con il suo contenuto) nell'altro template.
-Per l'id "i" si deve eliminare solo il tag preso in considerazione e non anche i tag contenuti in esso ed il testo se presenti.
-Per l'id "j" il tag modificato dovrà sempre essere un tag html standard.
-Per l'id "k" si intende l'inserimento di un nuovo tag html standard come fratello del tag in questione.

Un'altra cosa molto importante, voglio che tutti i codici html (mutanti) che mi invii devono essere tutti funzionanti/eseguibili, ovvero non devono generarmi un'errore quando avvio il frontend

Infine voglio che mi strutturi la risposta in modo da avere le 11 mutazioni (presenti nella prima foto allegata) per ogni tag descritto sopra, inoltre inviami sempre il codice completo mutato e per ogni codice mutato assegnagli un nome che descrive la modifica fatta. Inviami tutti i codici con estensione .txt.

Rispondimi solo con OK se hai capito tutto, dal prossimo messaggio ti invierò il codice da mutare ed il tag target.

3) Allegare al messaggio le 2 foto che si trovano nella cartella rispettivamente in questo ordine : 1) tipologie-mutazioni 2) tipi-di-tag

4) Attendere la risposta con "OK"

5) Inviare quest'ultimo prompt ed aspettare che vengano generate le mutazioni:

Codice html: "Inserire qui il codice da mutare"

Tag target: "Inserire qui il tag target"

6) Scaricare tutti i file .txt contenenti le mutazioni e metterli nella cartella "mutantsToTest" del progetto