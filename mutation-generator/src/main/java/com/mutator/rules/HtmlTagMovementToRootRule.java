package com.mutator.rules;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

public class HtmlTagMovementToRootRule implements MutationRule {

    @Override
    public boolean apply(Element element) {
        Document doc = element.ownerDocument();
        if (doc == null) {
            return false;
        }

        String tagName = element.tagName().toLowerCase();
        if (tagName.equals("html") || tagName.equals("head") || tagName.equals("body")) {
            return false;
        }

        // Se l'elemento è già un figlio diretto della radice, non facciamo nulla.
        if (element.parent() == doc) {
            return false;
        }

        // Aggiunge l'elemento come ultimo figlio del documento.
        doc.appendChild(element);
        return true;
    }

    @Override
    public String getRuleName() {
        return "html_tag_movement_to_root";
    }
}