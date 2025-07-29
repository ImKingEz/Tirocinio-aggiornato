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

        if (attributes.hasKey("id")) {
            String originalValue = element.id();
            element.id(originalValue + "_mutated");
            return true;
        }

        if (attributes.hasKey("class")) {
            String originalValue = element.className();
            element.addClass(originalValue + "_mutated");
            return true;
        }

        for (Attribute attr : attributes) {
            String key = attr.getKey();
            if (!key.equalsIgnoreCase("id") && !key.equalsIgnoreCase("class") && !key.startsWith("x-test-")) {
                String originalValue = attr.getValue();
                if (originalValue.isEmpty()) {
                    element.attr(key, "mutated");
                } else {
                    element.attr(key, originalValue + "_mutated");
                }
                return true;
            }
        }
        return false;
    }

    @Override
    public String getRuleName() {
        return "attribute_value_modification";
    }
}