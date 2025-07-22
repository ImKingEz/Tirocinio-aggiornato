package com.mutator.rules;

import org.jsoup.nodes.Element;

public class HtmlTagTypeModificationRule implements MutationRule {

    @Override
    public boolean apply(Element element) {
        String oldTagName = element.tagName().toLowerCase();
        String newTagName;

        // Non modifichiamo i tag strutturali principali
        if (oldTagName.equals("html") || oldTagName.equals("head") || oldTagName.equals("body")) {
            return false;
        }

        // Mappatura delle mutazioni più significative per i test E2E
        switch (oldTagName) {
            case "a":
                newTagName = "button";
                break;
            case "button":
                newTagName = "a";
                break;
            case "input":
                newTagName = "div";
                break;
            case "div":
                newTagName = "span";
                break;
            case "span":
                newTagName = "div";
                break;
            case "h1": newTagName = "h2"; break;
            case "h2": newTagName = "h3"; break;
            default:
                newTagName = "div";
                break;
        }

        element.tagName(newTagName);
        return true;
    }

    @Override
    public String getRuleName() {
        return "html_tag_type_modification";
    }
}