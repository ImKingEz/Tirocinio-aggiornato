package com.mutator.rules;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.util.Optional;

public class HtmlTagMovementBetweenTemplatesRule implements MutationRule {

    @Override
    public boolean apply(Element element) {
        Document doc = element.ownerDocument();
        if (doc == null) {
            return false;
        }

        // 1. Trova il template genitore attuale dell'elemento.
        Element sourceTemplate = element.closest("[^x-test-tpl]");
        if (sourceTemplate == null) {
            // L'elemento non si trova all'interno di un template, quindi non possiamo spostarlo "da" un template.
            return false;
        }

        // 2. Cerca tutti i possibili template nel documento.
        Elements allTemplates = doc.select("[^x-test-tpl]");
        if (allTemplates.size() < 2) {
            // Non ci sono altri template in cui spostare l'elemento.
            return false;
        }

        // 3. Trova un template di destinazione che non sia quello di origine.
        Optional<Element> destinationTemplateOpt = allTemplates.stream()
                .filter(template -> !template.equals(sourceTemplate))
                .findFirst();

        if (destinationTemplateOpt.isPresent()) {
            // 4. Spostiamo l'elemento.
            Element destinationTemplate = destinationTemplateOpt.get();
            destinationTemplate.appendChild(element);
            return true;
        }

        return false;
    }

    @Override
    public String getRuleName() {
        return "html_tag_movement_between_templates";
    }
}