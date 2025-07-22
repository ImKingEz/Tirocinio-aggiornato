package com.mutator;

import com.mutator.rules.*;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.*;

public class Mutator {

    private final Document originalDoc;
    private final Element alpha; // Target principale
    private final Path outputDir;
    private final Map<String, Element> targets = new HashMap<>();
    private final List<MutationRule> mutationRules = new ArrayList<>();

    public Mutator(Document doc, Element alpha, Path outputDir) {
        this.originalDoc = doc;
        this.alpha = alpha;
        this.outputDir = outputDir;
        identifyTargets();
        initializeRules();
    }

    private void identifyTargets() {
        // Pulisce la mappa dei target per ogni esecuzione (se il Mutator venisse riutilizzato)
        targets.clear();

        // 1. Identifica il target principale
        targets.put("alpha(" + alpha.tagName() + ")", alpha);

        // 2. Identifica il genitore (beta)
        if (alpha.parent() != null) {
            Element beta = alpha.parent();
            targets.put("beta(" + beta.tagName() + ")", beta);

            // 3. Identifica l'antenato a 2 livelli (gamma)
            if (beta.parent() != null) {
                Element gamma = beta.parent();
                // Evitiamo di aggiungere il <body> come gamma, non è significativo
                if (!gamma.tagName().equalsIgnoreCase("body")) {
                    targets.put("gamma(" + gamma.tagName() + ")", gamma);
                }
            }
        }

        // 4. Identifica i fratelli (delta)
        if (alpha.nextElementSibling() != null) {
            Element deltaNext = alpha.nextElementSibling();
            targets.put("delta_next(" + deltaNext.tagName() + ")", deltaNext);
        }
        if (alpha.previousElementSibling() != null) {
            Element deltaPrev = alpha.previousElementSibling();
            targets.put("delta_prev(" + deltaPrev.tagName() + ")", deltaPrev);
        }

        // 5. --- LOGICA CORRETTA PER EPSILON ---
        // Cerca tra gli antenati di 'alpha' il primo che ha un attributo che inizia con "x-test-tpl".
        // Usiamo un selettore di attributi che iniziano con una data stringa: [^attributo]
        Element epsilon = alpha.closest("[^x-test-tpl]");

        if (epsilon != null) {
            // Aggiungiamo epsilon solo se non è già stato aggiunto come un altro target (es. gamma)
            if (!targets.containsValue(epsilon)) {
                targets.put("epsilon(" + epsilon.tagName() + ")", epsilon);
            }
        }

        System.out.println("Identified targets: " + targets.keySet());
    }

    private void initializeRules() {
        mutationRules.add(new AttributeValueModificationRule());        // Rule 'a'
        mutationRules.add(new AttributeRemovalRule());                  // Rule 'b'
        mutationRules.add(new AttributeIdentifierModificationRule());   // Rule 'c'
        mutationRules.add(new TextContentModificationRule());           // Rule 'd'
        mutationRules.add(new TextContentRemovalRule());                // Rule 'e'
        mutationRules.add(new HtmlTagMovementWithinContainerRule());    // Rule 'f'
        mutationRules.add(new HtmlTagMovementToRootRule());             // Rule 'g'
        mutationRules.add(new HtmlTagMovementBetweenTemplatesRule());   // Rule 'h'
        mutationRules.add(new HtmlTagRemovalRule());                    // Rule 'i'
        mutationRules.add(new HtmlTagTypeModificationRule());           // Rule 'j'
        mutationRules.add(new HtmlTagInsertionRule());                  // Rule 'k'
    }

    public int generateMutations() {
        int count = 0;
        for (MutationRule rule : mutationRules) {
            for (Map.Entry<String, Element> targetEntry : targets.entrySet()) {
                String targetName = targetEntry.getKey();

                Document docClone = originalDoc.clone();
                Element targetInClone = findElementInClone(docClone, targetEntry.getValue());

                if (targetInClone != null) {
                    // --- NUOVA LOGICA DI CONTROLLO ---
                    // 1. Salva l'HTML prima della mutazione
                    String htmlBefore = docClone.body().html();

                    // 2. Applica la regola di mutazione
                    boolean mutationAttempted = rule.apply(targetInClone);

                    // 3. Salva l'HTML dopo la mutazione
                    String htmlAfter = docClone.body().html();

                    // 4. Salva il file SOLO se la regola ha tentato una modifica
                    //    E il contenuto HTML è effettivamente cambiato.
                    if (mutationAttempted && !htmlBefore.equals(htmlAfter)) {
                        String filename = String.format("mutant_%s_%s.txt", targetName, rule.getRuleName());
                        saveMutant(docClone, filename);
                        count++;
                    }
                }
            }
        }
        return count;
    }

    // Trova l'elemento corrispondente nel documento clonato

    private Element findElementInClone(Document clone, Element originalElement) {
        // Il target 'epsilon' è il documento stesso, quindi il suo clone è il documento clonato.
        // Il metodo cssSelector() fallisce sulla radice. Gestiamo questo caso speciale.
        if (originalElement == this.originalDoc.root()) {
            return clone.root();
        }

        String selector = originalElement.cssSelector();

        if (selector.isEmpty()) {
            System.err.println("Warning: Could not generate a reliable CSS selector for element: <" + originalElement.tagName() + ">. Skipping mutations for this target.");
            return null;
        }

        return clone.select(selector).first();
    }

    private void saveMutant(Document mutatedDoc, String filename) {
        try {
            Path outputPath = outputDir.resolve(filename);

            // --- MODIFICA CHIAVE ---
            // Invece di mutatedDoc.outerHtml(), che restituisce l'intero documento (incluso <html>, ecc.),
            // usiamo mutatedDoc.body().html().
            // Questo restituisce solo l'HTML INTERNO del tag <body>, che corrisponde
            // al nostro frammento originale, ma con le mutazioni applicate.
            String mutantContent = mutatedDoc.body().html();

            Files.write(outputPath, mutantContent.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            System.out.println(" -> Saved: " + filename);
        } catch (IOException e) {
            System.err.println("Error saving mutant file " + filename + ": " + e.getMessage());
        }
    }
}