package com.mutator.rules;

import org.jsoup.nodes.Element;

public class HtmlTagInsertionRule implements MutationRule {

    @Override
    public boolean apply(Element element) {
        // Non si può wrappare il tag <html>
        if (element.tagName().equalsIgnoreCase("html")) {
            return false;
        }

        // Inserisce un <div> come nuovo genitore dell'elemento corrente.
        element.wrap("<div class='mutated-wrapper'></div>");
        return true;
    }

    @Override
    public String getRuleName() {
        return "html_tag_insertion";
    }
}