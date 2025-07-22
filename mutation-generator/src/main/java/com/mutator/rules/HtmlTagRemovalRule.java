package com.mutator.rules;

import org.jsoup.nodes.Element;

public class HtmlTagRemovalRule implements MutationRule {

    @Override
    public boolean apply(Element element) {
        // Se non ha un genitore, è un nodo radice e non può essere rimosso in questo modo.
        if (element.parent() == null) {
            return false;
        }

        String tagName = element.tagName().toLowerCase();
        if (tagName.equals("html") || tagName.equals("head") || tagName.equals("body")) {
            return false;
        }

        element.unwrap();
        return true;
    }

    @Override
    public String getRuleName() {
        return "html_tag_removal";
    }
}