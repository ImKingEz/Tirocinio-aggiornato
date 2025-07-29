package com.mutator;

import com.mutator.rules.*;
import com.mutator.utils.TemplateUtils;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.*;
import java.util.regex.Pattern;

public class Mutator {

    private static final String TEMP_ID_ATTR = "data-mutator-temp-id";

    private final Document originalDoc;
    private final Element alpha;
    private final Path outputDir;
    private final Map<String, Element> targets = new HashMap<>();
    private final List<MutationRule> mutationRules = new ArrayList<>();

    public Mutator(Document doc, Element alpha, Path outputDir) {
        this.originalDoc = doc;
        this.alpha = alpha;
        this.outputDir = outputDir;
        addTemporaryIds(this.originalDoc);
        identifyTargets();
        initializeRules();
    }

    private void addTemporaryIds(Document doc) {
        Elements allElements = doc.getAllElements();
        for (int i = 0; i < allElements.size(); i++) {
            Element el = allElements.get(i);
            if (!el.hasAttr(TEMP_ID_ATTR)) {
                el.attr(TEMP_ID_ATTR, String.valueOf(i));
            }
        }
    }

    private void identifyTargets() {
        targets.clear();
        targets.put("alpha(" + alpha.tagName() + ")", alpha);

        if (alpha.parent() != null) {
            Element beta = alpha.parent();
            targets.put("beta(" + beta.tagName() + ")", beta);
            if (beta.parent() != null) {
                Element gamma = beta.parent();
                if (!gamma.tagName().equalsIgnoreCase("body") && !gamma.tagName().equalsIgnoreCase("#root")) {
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
        Element epsilon = TemplateUtils.findClosestTemplate(alpha);
        if (epsilon != null && !targets.containsValue(epsilon)) {
            targets.put("epsilon(" + epsilon.tagName() + ")", epsilon);
        }

        System.out.println("Identified targets: " + targets.keySet());
    }

    private void initializeRules() {
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
        int count = 0;
        for (MutationRule rule : mutationRules) {
            for (Map.Entry<String, Element> targetEntry : targets.entrySet()) {
                String targetName = targetEntry.getKey();

                Document docClone = originalDoc.clone();
                Element targetInClone = findElementInClone(docClone, targetEntry.getValue());

                if (targetInClone != null) {
                    String htmlBefore = docClone.html();
                    boolean mutationAttempted = rule.apply(targetInClone);
                    String htmlAfter = docClone.html();

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

    private Element findElementInClone(Document clone, Element originalElement) {
        String tempId = originalElement.attr(TEMP_ID_ATTR);
        if (tempId.isEmpty()) {
            System.err.println("CRITICAL ERROR: Original element is missing a temporary ID. Cannot find in clone. Element: <" + originalElement.tagName() + ">");
            return null;
        }
        String safeSelector = String.format("[%s=\"%s\"]", TEMP_ID_ATTR, tempId);
        Element foundElement = clone.selectFirst(safeSelector);
        if (foundElement == null) {
            System.err.println("CRITICAL ERROR: Failed to find element in clone using selector: '" + safeSelector + "'");
        }
        return foundElement;
    }

    // Questa regex trova un carattere '@' che NON è seguito da una parola chiave del control flow di Angular.
    // L'espressione (?!) è un "negative lookahead".
    // \b è un "word boundary" per assicurare che non matchi parole come "different".
    private static final Pattern ANGULAR_AT_SIGN_PATTERN = Pattern.compile(
            "@(?!(if|for|switch|defer|placeholder|loading|error|else)\\b)"
    );

    private void saveMutant(Document mutatedDoc, String filename) {
        try {
            Path outputPath = outputDir.resolve(filename);
            mutatedDoc.select("[" + TEMP_ID_ATTR + "]").removeAttr(TEMP_ID_ATTR);

            String mutantContent = mutatedDoc.html();

            // Questo converte in entità TUTTI gli '@' che non appartengono alla sintassi del control flow di Angular
            mutantContent = ANGULAR_AT_SIGN_PATTERN.matcher(mutantContent).replaceAll("&#64;");

            Files.write(outputPath, mutantContent.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            System.out.println(" -> Saved: " + filename);
        } catch (IOException e) {
            System.err.println("Error saving mutant file " + filename + ": " + e.getMessage());
        }
    }
}