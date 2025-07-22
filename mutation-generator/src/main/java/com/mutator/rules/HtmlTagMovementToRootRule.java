package com.mutator.rules;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

public class HtmlTagMovementToRootRule implements MutationRule {

    @Override
    public boolean apply(Element element) {
        Document doc = element.ownerDocument();
        if (doc == null || doc.body() == null) {
            return false;
        }
        String tagName = element.tagName().toLowerCase();
        if (tagName.equals("html") || tagName.equals("head") || tagName.equals("body")) {
            return false;
        }
        Element parent = element.parent();
        if (parent == null || parent == doc.body()) {
            return false;
        }
        doc.body().appendChild(element);
        return true;
    }

    @Override
    public String getRuleName() {
        return "html_tag_movement_to_root";
    }
}