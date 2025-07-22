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

        // Priorità 1: Modificare l'attributo 'id'
        if (attributes.hasKeyIgnoreCase("id")) {
            String value = element.attr("id");
            element.removeAttr("id");
            element.attr("mutated_id", value);
            return true;
        }

        // Priorità 2: Modificare l'attributo 'class'
        if (attributes.hasKeyIgnoreCase("class")) {
            String value = element.attr("class");
            element.removeAttr("class");
            element.attr("mutated_class", value);
            return true;
        }

        // Priorità 3: Modificare qualsiasi altro attributo che non sia un hook
        for (Attribute attr : attributes) {
            String key = attr.getKey().toLowerCase();
            // L'id e la classe sono già stati controllati, quindi non è necessario escluderli di nuovo.
            // Dobbiamo solo assicurarci che non sia un hook di test.
            if (!key.startsWith("x-test-")) {
                String oldKey = attr.getKey();
                String value = attr.getValue();
                String newKey = "mutated_" + oldKey;

                // Rimuovi il vecchio attributo e aggiungi quello nuovo
                element.removeAttr(oldKey);
                element.attr(newKey, value);
                return true;
            }
        }

        // Se siamo qui, l'elemento ha solo attributi hook o nessun attributo modificabile.
        return false;
    }

    @Override
    public String getRuleName() {
        return "attribute_identifier_modification";
    }
}