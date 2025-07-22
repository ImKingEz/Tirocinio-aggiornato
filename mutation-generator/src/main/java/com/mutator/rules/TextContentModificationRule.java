package com.mutator.rules;

import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.nodes.TextNode;

public class TextContentModificationRule implements MutationRule {

    @Override
    public boolean apply(Element element) {
        // Iteriamo sui figli diretti dell'elemento per trovare un TextNode non vuoto.
        for (Node child : element.childNodes()) {
            if (child instanceof TextNode) {
                TextNode textNode = (TextNode) child;
                String originalText = textNode.getWholeText();
                // Modifichiamo solo se il testo non è composto solo da spazi/a capo.
                if (originalText.trim().length() > 0) {
                    textNode.text("Text mutated");
                    return true;
                }
            }
        }
        return false;
    }

    @Override
    public String getRuleName() {
        return "text_content_modification";
    }
}