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

        if (attributes.hasKey("id")) {
            element.removeAttr("id");
            return true;
        }

        if (attributes.hasKey("class")) {
            element.removeAttr("class");
            return true;
        }

        for (Attribute attr : attributes) {
            String key = attr.getKey();
            if (!key.equalsIgnoreCase("id") && !key.equalsIgnoreCase("class") && !key.startsWith("x-test-")) {
                element.removeAttr(key);
                return true;
            }
        }

        return false;
    }

    @Override
    public String getRuleName() {
        return "attribute_removal";
    }
}