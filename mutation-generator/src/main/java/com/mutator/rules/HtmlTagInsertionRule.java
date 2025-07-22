package com.mutator.rules;

import org.jsoup.nodes.Element;

public class HtmlTagInsertionRule implements MutationRule {

    @Override
    public boolean apply(Element element) {
        // Non si può inserire un fratello per i tag radice come <html>, <head> o <body>.
        String tagName = element.tagName().toLowerCase();
        if (tagName.equals("html") || tagName.equals("head") || tagName.equals("body")) {
            return false;
        }

        // Se l'elemento non ha un genitore, non può avere fratelli.
        if (element.parent() == null) {
            return false;
        }

        // Inserisce un <div> come nuovo fratello dell'elemento corrente,
        // posizionandolo subito dopo.
        element.after("<div class='mutated-sibling'></div>");
        return true;
    }

    @Override
    public String getRuleName() {
        return "html_tag_sibling_insertion";
    }
}