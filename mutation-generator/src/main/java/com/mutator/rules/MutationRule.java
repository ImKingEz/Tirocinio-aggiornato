package com.mutator.rules;

import org.jsoup.nodes.Element;

public interface MutationRule {
    /**
     * Tenta di applicare la regola di mutazione all'elemento fornito.
     * @param element L'elemento target su cui applicare la mutazione.
     * @return true se la mutazione ha modificato con successo l'elemento, false altrimenti.
     */
    boolean apply(Element element);

    /**
     * Restituisce un nome breve e descrittivo per la regola, usato per il nome del file.
     * @return Il nome della regola (es. "attribute_removal").
     */
    String getRuleName();
}