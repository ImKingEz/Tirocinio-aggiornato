package com.mutator.utils;

import org.jsoup.nodes.Attribute;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import java.util.ArrayList;
import java.util.List;

/**
 * Classe di utilità per lavorare con elementi "template" identificati
 * da attributi che iniziano con 'x-test-tpl'.
 */
public final class TemplateUtils {

    // Rende la classe non istanziabile
    private TemplateUtils() {}

    /**
     * Trova l'antenato più vicino (incluso l'elemento stesso) che funge da template.
     * Un template è un elemento con un attributo che inizia con "x-test-tpl".
     *
     * @param start L'elemento da cui iniziare la ricerca.
     * @return L'elemento template trovato, o null se non ne viene trovato nessuno.
     */
    public static Element findClosestTemplate(Element start) {
        Element current = start;
        while (current != null) {
            if (isTemplate(current)) {
                return current;
            }
            current = current.parent();
        }
        return null;
    }

    /**
     * Trova tutti gli elementi in un documento che fungono da template.
     *
     * @param doc Il documento in cui cercare.
     * @return Una lista di elementi template.
     */
    public static List<Element> findAllTemplates(Document doc) {
        List<Element> templates = new ArrayList<>();
        for (Element el : doc.getAllElements()) {
            if (isTemplate(el)) {
                templates.add(el);
            }
        }
        return templates;
    }

    /**
     * Controlla se un dato elemento è un template.
     *
     * @param element L'elemento da controllare.
     * @return true se l'elemento ha un attributo che inizia con "x-test-tpl", altrimenti false.
     */
    public static boolean isTemplate(Element element) {
        if (element == null) return false;
        for (Attribute attr : element.attributes()) {
            if (attr.getKey().startsWith("x-test-tpl")) {
                return true;
            }
        }
        return false;
    }
}