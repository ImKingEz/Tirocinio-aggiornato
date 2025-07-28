package com.mutator;

import com.mutator.rules.*;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements; // <-- IMPORT AGGIUNTO

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.*;

public class Mutator {

    // --- MODIFICA 1: Definiamo il nome del nostro attributo temporaneo ---
    // Useremo questo attributo per marcare in modo univoco ogni elemento.
    private static final String TEMP_ID_ATTR = "data-mutator-temp-id";

    private final Document originalDoc;
    private final Element alpha; // Target principale
    private final Path outputDir;
    private final Map<String, Element> targets = new HashMap<>();
    private final List<MutationRule> mutationRules = new ArrayList<>();

    public Mutator(Document doc, Element alpha, Path outputDir) {
        this.originalDoc = doc;
        this.alpha = alpha;
        this.outputDir = outputDir;

        // --- MODIFICA 2: Marchiamo ogni elemento del documento originale PRIMA di fare qualsiasi altra cosa ---
        // Questa operazione viene eseguita una sola volta e rende affidabile la ricerca successiva.
        addTemporaryIds(this.originalDoc);

        identifyTargets();
        initializeRules();
    }

    /**
     * NUOVO METODO: Aggiunge un attributo temporaneo con un ID univoco a ogni elemento del documento.
     * Questo ci permette di trovare in modo infallibile l'elemento corrispondente in un clone.
     * @param doc Il documento da marcare.
     */
    private void addTemporaryIds(Document doc) {
        Elements allElements = doc.getAllElements();
        for (int i = 0; i < allElements.size(); i++) {
            Element el = allElements.get(i);
            // Assegniamo l'indice del ciclo come ID univoco.
            if (!el.hasAttr(TEMP_ID_ATTR)) {
                el.attr(TEMP_ID_ATTR, String.valueOf(i));
            }
        }
    }

    private void identifyTargets() {
        // Questo metodo rimane invariato.
        targets.clear();
        targets.put("alpha(" + alpha.tagName() + ")", alpha);
        if (alpha.parent() != null) {
            Element beta = alpha.parent();
            targets.put("beta(" + beta.tagName() + ")", beta);
            if (beta.parent() != null) {
                Element gamma = beta.parent();
                if (!gamma.tagName().equalsIgnoreCase("body")) {
                    targets.put("gamma(" + gamma.tagName() + ")", gamma);
                }
            }
        }
        if (alpha.nextElementSibling() != null) {
            Element deltaNext = alpha.nextElementSibling();
            targets.put("delta_next(" + deltaNext.tagName() + ")", deltaNext);
        }
        if (alpha.previousElementSibling() != null) {
            Element deltaPrev = alpha.previousElementSibling();
            targets.put("delta_prev(" + deltaPrev.tagName() + ")", deltaPrev);
        }
        Element epsilon = alpha.closest("[^x-test-tpl]");
        if (epsilon != null && !targets.containsValue(epsilon)) {
            targets.put("epsilon(" + epsilon.tagName() + ")", epsilon);
        }
        System.out.println("Identified targets: " + targets.keySet());
    }

    private void initializeRules() {
        // Questo metodo rimane invariato.
        mutationRules.add(new AttributeValueModificationRule());
        mutationRules.add(new AttributeRemovalRule());
        mutationRules.add(new AttributeIdentifierModificationRule());
        mutationRules.add(new TextContentModificationRule());
        mutationRules.add(new TextContentRemovalRule());
        mutationRules.add(new HtmlTagMovementWithinContainerRule());
        mutationRules.add(new HtmlTagMovementToRootRule());
        mutationRules.add(new HtmlTagMovementBetweenTemplatesRule());
        mutationRules.add(new HtmlTagRemovalRule());
        mutationRules.add(new HtmlTagTypeModificationRule());
        mutationRules.add(new HtmlTagInsertionRule());
    }

    public int generateMutations() {
        // Questo metodo rimane invariato nella sua logica principale.
        int count = 0;
        for (MutationRule rule : mutationRules) {
            for (Map.Entry<String, Element> targetEntry : targets.entrySet()) {
                String targetName = targetEntry.getKey();

                // Il clone erediterà tutti gli attributi temporanei che abbiamo aggiunto.
                Document docClone = originalDoc.clone();
                Element targetInClone = findElementInClone(docClone, targetEntry.getValue());

                if (targetInClone != null) {
                    String htmlBefore = docClone.body().html();
                    boolean mutationAttempted = rule.apply(targetInClone);
                    String htmlAfter = docClone.body().html();

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

    /**
     * --- MODIFICA 3: Metodo di ricerca completamente riscritto e reso infallibile ---
     * Invece di usare il fragile cssSelector(), ora usiamo il nostro attributo temporaneo.
     */
    private Element findElementInClone(Document clone, Element originalElement) {
        // 1. Recupera l'ID temporaneo che abbiamo assegnato all'elemento originale.
        String tempId = originalElement.attr(TEMP_ID_ATTR);

        // 2. Controlla se l'ID esiste (non dovrebbe mai fallire in questo flusso).
        if (tempId.isEmpty()) {
            System.err.println("CRITICAL ERROR: Original element is missing a temporary ID. Cannot find in clone. Element: <" + originalElement.tagName() + ">");
            return null;
        }

        // 3. Crea un selettore di attributi. Questo è sicuro, veloce e non genera errori di parsing.
        // Esempio: [data-mutator-temp-id="42"]
        String safeSelector = String.format("[%s=\"%s\"]", TEMP_ID_ATTR, tempId);

        // 4. Cerca l'elemento nel clone usando il selettore sicuro.
        Element foundElement = clone.selectFirst(safeSelector);

        if (foundElement == null) {
             System.err.println("CRITICAL ERROR: Failed to find element in clone using selector: '" + safeSelector + "'");
        }
        return foundElement;
    }

    /**
     * --- MODIFICA 4: Aggiunta fase di pulizia prima di salvare ---
     */
    private void saveMutant(Document mutatedDoc, String filename) {
        try {
            Path outputPath = outputDir.resolve(filename);

            // --- FASE DI PULIZIA ---
            // Prima di salvare, rimuoviamo tutti gli attributi temporanei dal documento
            // per non "sporcare" l'output finale.
            mutatedDoc.select("[" + TEMP_ID_ATTR + "]").removeAttr(TEMP_ID_ATTR);

            // Ora il contenuto è pulito e pronto per essere salvato.
            String mutantContent = mutatedDoc.body().html();

            Files.write(outputPath, mutantContent.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            System.out.println(" -> Saved: " + filename);
        } catch (IOException e) {
            System.err.println("Error saving mutant file " + filename + ": " + e.getMessage());
        }
    }
}