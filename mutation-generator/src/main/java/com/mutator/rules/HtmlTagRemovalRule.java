package com.mutator.rules;

import org.jsoup.nodes.Element;

public class HtmlTagRemovalRule implements MutationRule {

    @Override
    public boolean apply(Element element) {
        // CONDIZIONE DI SICUREZZA AGGIORNATA:
        // Per "srotolare" (unwrap) un nodo, questo deve avere un genitore.
        // Se non ha un genitore, è un nodo radice e non può essere rimosso in questo modo.
        if (element.parent() == null) {
            return false;
        }

        // Inoltre, è buona pratica non rimuovere i tag strutturali principali
        // anche se hanno un genitore (es. body è figlio di html).
        String tagName = element.tagName().toLowerCase();
        if (tagName.equals("html") || tagName.equals("head") || tagName.equals("body")) {
            return false;
        }

        // Se i controlli sono superati, l'operazione è sicura.
        element.unwrap();
        return true;
    }

    @Override
    public String getRuleName() {
        return "html_tag_removal";
    }
}