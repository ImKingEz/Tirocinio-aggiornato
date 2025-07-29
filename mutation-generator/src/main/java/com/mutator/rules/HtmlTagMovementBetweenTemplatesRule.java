package com.mutator.rules;

import com.mutator.utils.TemplateUtils;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import java.util.List;
import java.util.Optional;

public class HtmlTagMovementBetweenTemplatesRule implements MutationRule {

    @Override
    public boolean apply(Element element) {
        Document doc = element.ownerDocument();
        if (doc == null) {
            return false;
        }

        Element sourceTemplate = TemplateUtils.findClosestTemplate(element);
        if (sourceTemplate == null) {
            return false;
        }

        List<Element> allTemplates = TemplateUtils.findAllTemplates(doc);
        if (allTemplates.size() < 2) {
            return false;
        }

        // Trova un template di destinazione diverso da quello di origine.
        Optional<Element> destinationTemplateOpt = allTemplates.stream()
                .filter(template -> !template.equals(sourceTemplate))
                .findFirst();

        if (destinationTemplateOpt.isPresent()) {
            Element destinationTemplate = destinationTemplateOpt.get();
            destinationTemplate.appendChild(element);
            return true;
        }

        return false;
    }

    @Override
    public String getRuleName() {
        return "html_tag_movement_between_templates";
    }
}