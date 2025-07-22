package com.mutator.rules;

import org.jsoup.nodes.Element;
import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Attribute;

public class AttributeValueModificationRule implements MutationRule {

    @Override
    public boolean apply(Element element) {
        Attributes attributes = element.attributes();
        if (attributes.isEmpty()) {
            return false;
        }

        // Priorità 1: Modificare il valore dell'attributo 'id'
        if (attributes.hasKeyIgnoreCase("id")) {
            String originalValue = element.id();
            element.id(originalValue + "_mutated");
            return true;
        }

        // Priorità 2: Modificare il valore dell'attributo 'class'
        if (attributes.hasKeyIgnoreCase("class")) {
            String originalValue = element.className();
            element.addClass(originalValue + "_mutated");
            return true;
        }

        for (Attribute attr : attributes) {
            String key = attr.getKey().toLowerCase();
            if (!key.equals("id") && !key.equals("class") && !key.startsWith("x-test-")) {
                String originalValue = attr.getValue();
                element.attr(attr.getKey(), originalValue + "_mutated");
                return true;
            }
        }

        // Se siamo qui, l'elemento ha solo attributi id, class o hook.
        return false;
    }

    @Override
    public String getRuleName() {
        return "attribute_value_modification";
    }
}