package com.mutator.rules;

import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.nodes.TextNode;

import java.util.ArrayList;
import java.util.List;

public class TextContentRemovalRule implements MutationRule {

    @Override
    public boolean apply(Element element) {
        // Troviamo tutti i nodi di testo da rimuovere per non causare ConcurrentModificationException
        List<Node> nodesToRemove = new ArrayList<>();
        for (Node child : element.childNodes()) {
            if (child instanceof TextNode) {
                // Rimuoviamo solo se il testo non è solo whitespace.
                if (((TextNode) child).getWholeText().trim().length() > 0) {
                    nodesToRemove.add(child);
                }
            }
        }

        if (!nodesToRemove.isEmpty()) {
            nodesToRemove.forEach(Node::remove);
            return true;
        }

        return false;
    }

    @Override
    public String getRuleName() {
        return "text_content_removal";
    }
}