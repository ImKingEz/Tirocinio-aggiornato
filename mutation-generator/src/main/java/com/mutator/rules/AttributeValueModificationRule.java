package com.mutator.rules;

import org.jsoup.nodes.Element;
import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Attribute; // Importa la classe Attribute

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
            // Per le classi, aggiungere una classe spazzatura è una buona mutazione
            element.addClass("mutated-class");
            return true;
        }

        // --- BLOCCO CORRETTO PER PRIORITÀ 3 ---
        // Iteriamo direttamente sugli oggetti Attribute, che è l'approccio pubblico
        for (Attribute attr : attributes) {
            String key = attr.getKey().toLowerCase();
            // Saltiamo 'id' e 'class' perché li abbiamo già gestiti, e saltiamo gli hook
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