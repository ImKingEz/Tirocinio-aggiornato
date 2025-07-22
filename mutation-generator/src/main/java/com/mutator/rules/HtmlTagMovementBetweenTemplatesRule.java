package com.mutator.rules;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.util.Optional;

public class HtmlTagMovementBetweenTemplatesRule implements MutationRule {

    /**
     * Simula la regola 'h': Spostamento di un tag HTML tra template.
     * Cerca un altro contenitore con un attributo "x-test-tpl" nel documento
     * e sposta l'elemento lì.
     * @param element L'elemento da spostare.
     * @return true se la mutazione è stata applicata con successo, false altrimenti.
     */
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
            // 4. Abbiamo una destinazione! Spostiamo l'elemento.
            Element destinationTemplate = destinationTemplateOpt.get();
            destinationTemplate.appendChild(element);
            return true;
        }

        // Se siamo qui, qualcosa è andato storto (es. l'unico altro template è stato rimosso?).
        return false;
    }

    @Override
    public String getRuleName() {
        return "html_tag_movement_between_templates";
    }
}