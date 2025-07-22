package com.mutator.rules;

import org.jsoup.nodes.Element;

public class HtmlTagMovementWithinContainerRule implements MutationRule {

    @Override
    public boolean apply(Element element) {
        Element parent = element.parent();
        // La mutazione ha senso solo se il parent esiste e ha più di un figlio elemento.
        if (parent == null || parent.childrenSize() <= 1) {
            return false;
        }

        int originalIndex = element.elementSiblingIndex();
        // Se l'elemento è già l'ultimo, spostarlo alla fine non è una mutazione.
        // Lo spostiamo all'inizio. Se è già all'inizio, lo spostiamo alla fine.
        if (originalIndex == 0) {
            parent.appendChild(element); // Sposta alla fine
        } else {
            parent.insertChildren(0, element); // Sposta all'inizio
        }
        return true;
    }

    @Override
    public String getRuleName() {
        return "html_tag_movement_within_container";
    }
}