package com.mutator.rules;

import org.jsoup.nodes.Element;
import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Attribute;

public class AttributeRemovalRule implements MutationRule {

    @Override
    public boolean apply(Element element) {
        Attributes attributes = element.attributes();
        if (attributes.isEmpty()) {
            return false;
        }

        // Priorità 1: Rimuovere l'attributo 'id'
        if (attributes.hasKeyIgnoreCase("id")) {
            element.removeAttr("id");
            return true;
        }

        // Priorità 2: Rimuovere l'attributo 'class'
        if (attributes.hasKeyIgnoreCase("class")) {
            element.removeAttr("class");
            return true;
        }

        // Priorità 3: Rimuovere qualsiasi altro attributo che non sia un hook
        for (Attribute attr : attributes) {
            String key = attr.getKey().toLowerCase();
            if (!key.startsWith("x-test-")) {
                element.removeAttr(attr.getKey());
                return true;
            }
        }

        // Se siamo qui, l'elemento ha solo attributi hook. Non facciamo nulla.
        return false;
    }

    @Override
    public String getRuleName() {
        return "attribute_removal";
    }
}