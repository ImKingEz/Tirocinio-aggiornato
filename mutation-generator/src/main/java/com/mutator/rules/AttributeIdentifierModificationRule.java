package com.mutator.rules;

import org.jsoup.nodes.Attribute;
import org.jsoup.nodes.Element;

import java.util.Optional;

public class AttributeIdentifierModificationRule implements MutationRule {

    @Override
    public boolean apply(Element element) {
        // Trova il primo attributo che NON è un hook.
        Optional<Attribute> attrToMutate = element.attributes().asList().stream()
                .filter(attr -> !attr.getKey().toLowerCase().startsWith("x-test-"))
                .findFirst();

        if (attrToMutate.isPresent()) {
            Attribute attr = attrToMutate.get();
            String oldKey = attr.getKey();
            String value = attr.getValue();
            String newKey = "mutated_" + oldKey;

            // Rimuovi il vecchio attributo e aggiungi quello nuovo
            element.removeAttr(oldKey);
            element.attr(newKey, value);
            return true;
        }

        return false;
    }

    @Override
    public String getRuleName() {
        return "attribute_identifier_modification";
    }
}