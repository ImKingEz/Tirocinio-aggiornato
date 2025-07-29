package com.mutator.rules;

import org.jsoup.nodes.Attribute;
import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Element;

public class AttributeIdentifierModificationRule implements MutationRule {

    @Override
    public boolean apply(Element element) {
        Attributes attributes = element.attributes();
        if (attributes.isEmpty()) {
            return false;
        }

        if (attributes.hasKey("id")) {
            String value = element.attr("id");
            element.removeAttr("id");
            element.attr("mutated_id", value);
            return true;
        }

        if (attributes.hasKey("class")) {
            String value = element.attr("class");
            element.removeAttr("class");
            element.attr("mutated_class", value);
            return true;
        }

        for (Attribute attr : attributes) {
            String key = attr.getKey();
            if (!key.equalsIgnoreCase("id") && !key.equalsIgnoreCase("class") && !key.startsWith("x-test-")) {
                String value = attr.getValue();
                String newKey = "mutated_" + key;
                element.removeAttr(key);
                element.attr(newKey, value);
                return true;
            }
        }

        return false;
    }

    @Override
    public String getRuleName() {
        return "attribute_identifier_modification";
    }
}