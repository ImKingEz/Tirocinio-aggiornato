package com.mutator;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.parser.Parser;
import picocli.CommandLine;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.Callable;

@Command(name = "mutation-generator", mixinStandardHelpOptions = true,
        description = "Generates HTML mutants based on a target element and predefined rules.")
public class MutationGenerator implements Callable<Integer> {

    @Option(names = {"-f", "--file"}, required = true, description = "The path to the input HTML file.")
    private File inputFile;

    @Option(names = {"-s", "--selector"}, required = true, description = "The CSS selector to identify the target tag (alpha).")
    private String targetSelector;

    @Option(names = {"-o", "--output-dir"}, required = true, description = "The directory where mutant files will be saved.")
    private Path outputDir;

    @Override
    public Integer call() throws Exception {
        // 1. Validazione e preparazione
        if (!inputFile.exists()) {
            System.err.println("Error: Input file not found at " + inputFile.getAbsolutePath());
            return 1;
        }
        Files.createDirectories(outputDir);
        System.out.println("Output directory: " + outputDir.toAbsolutePath());

        // 2. Parsing del file HTML con il PARSER XML per preservare il case
        Document doc = Jsoup.parse(inputFile, "UTF-8", "", Parser.xmlParser());
        doc.outputSettings().syntax(Document.OutputSettings.Syntax.html);

        // 3. Trova l'elemento target (alpha)
        Element alpha = doc.selectFirst(targetSelector);
        if (alpha == null) {
            System.err.println("Error: Target element could not be found with selector: '" + targetSelector + "'");
            return 1;
        }
        System.out.println("Found target element (alfa): " + alpha.tagName() + (alpha.id().isEmpty() ? "" : "#" + alpha.id()));

        // 4. Avvia il processo di mutazione
        Mutator mutator = new Mutator(doc, alpha, outputDir);
        int mutantsGenerated = mutator.generateMutations();

        System.out.println("\nProcess complete. Generated " + mutantsGenerated + " mutants.");
        return 0;
    }

    public static void main(String[] args) {
        int exitCode = new CommandLine(new MutationGenerator()).execute(args);
        System.exit(exitCode);
    }
}