package com.mutator;

import picocli.CommandLine;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

@Command(name = "img-self-closer", mixinStandardHelpOptions = true,
        description = "Aggiunge lo slash mancante ai tag <img ...> non self-closed in file HTML.")
public class ImgSelfCloser implements Callable<Integer> {

    @Option(names = {"-i", "--input"}, required = true,
            description = "File singolo oppure directory di input (ricorsiva).")
    private Path input;

    @Option(names = {"-o", "--output-dir"}, required = true,
            description = "Directory dove salvare i file corretti (viene creata se non esiste).")
    private Path outputDir;

    @Option(names = {"--always-save"}, description = "Se true salva sempre una copia anche se non ci sono modifiche.")
    private boolean alwaysSave = false;

    @Option(names = {"--all"}, description = "Se true processa tutti i file incontrati (ignora filtro estensioni).")
    private boolean processAllFiles = false;

    @Option(names = {"--extensions"}, description = "Estensioni dei file da processare, separate da virgola (default: .html,.htm,.component.html).")
    private String extensionsCsv = ".html,.htm,.component.html";

    @Option(names = {"--debug"}, description = "Log più verbosi per debug.")
    private boolean debug = false;

    // Pattern robusto per catturare un tag <img ...> considerando attributi in doppi/singoli apici
    private static final Pattern IMG_TAG_PATTERN = Pattern.compile(
            "<img\\b(?:(?:\"[^\"]*\"|'[^']*'|[^'\">])*)>",
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );

    // Pattern per trovare commenti HTML <!-- ... -->
    private static final Pattern HTML_COMMENT_PATTERN = Pattern.compile("<!--(?s).*?-->");

    private String[] extensions;

    @Override
    public Integer call() {
        try {
            // Normalizza percorsi
            input = input.toAbsolutePath().normalize();
            outputDir = outputDir.toAbsolutePath().normalize();

            // Parse estensioni
            extensions = parseExtensions(extensionsCsv);

            System.out.println("Input: " + input);
            System.out.println("Output: " + outputDir);
            System.out.println("Filter estensioni: " + String.join(", ", extensions));
            System.out.println("Processa tutti i file (--all): " + processAllFiles);
            System.out.println("Salva sempre (--always-save): " + alwaysSave);
            System.out.println("Debug: " + debug);
            System.out.println();

            if (!Files.exists(input)) {
                System.err.println("Input non trovato: " + input);
                return 2;
            }

            Files.createDirectories(outputDir);

            // Statistiche
            int totalFilesFound = 0;
            int totalFilesProcessed = 0;
            int totalImgsFound = 0;
            int totalImgsFixed = 0;
            int totalFilesWritten = 0;

            if (Files.isDirectory(input)) {
                try (Stream<Path> stream = Files.walk(input)) {
                    List<Path> files = stream.filter(Files::isRegularFile).toList();
                    totalFilesFound = files.size();
                    System.out.println("Trovati " + totalFilesFound + " file sotto " + input);
                    for (Path file : files) {
                        if (!processAllFiles && !hasAcceptableExtension(file)) {
                            if (debug) System.out.println("SKIP (estensione): " + file);
                            continue;
                        }
                        totalFilesProcessed++;
                        try {
                            Result r = processSingleFile(file, input);
                            totalImgsFound += r.imgsFound;
                            totalImgsFixed += r.imgsFixed;
                            if (r.written) totalFilesWritten++;
                        } catch (Exception e) {
                            System.err.println("Errore elaborando file " + file + ": " + e.getMessage());
                            if (debug) e.printStackTrace();
                        }
                    }
                }
            } else {
                // singolo file
                totalFilesFound = 1;
                if (!processAllFiles && !hasAcceptableExtension(input)) {
                    System.out.println("Attenzione: il file non ha estensione accettata ma verrà processato lo stesso perché è singolo.");
                }
                totalFilesProcessed = 1;
                try {
                    Result r = processSingleFile(input, input.getParent());
                    totalImgsFound += r.imgsFound;
                    totalImgsFixed += r.imgsFixed;
                    if (r.written) totalFilesWritten++;
                } catch (Exception e) {
                    System.err.println("Errore elaborando file " + input + ": " + e.getMessage());
                    if (debug) e.printStackTrace();
                }
            }

            // Riepilogo
            System.out.println();
            System.out.println("---- RIEPILOGO ----");
            System.out.println("File trovati:        " + totalFilesFound);
            System.out.println("File processati:     " + totalFilesProcessed);
            System.out.println("Tag <img> trovati:   " + totalImgsFound);
            System.out.println("Tag <img> corretti:  " + totalImgsFixed);
            System.out.println("File scritti:        " + totalFilesWritten);
            System.out.println("--------------------");
            System.out.println("Processo completato.");

            // Se non è stato scritto niente, ritorniamo un codice diverso per evidenziare
            return 0;
        } catch (Exception ex) {
            System.err.println("Errore critico: " + ex.getMessage());
            if (debug) ex.printStackTrace();
            return 3;
        }
    }

    private boolean hasAcceptableExtension(Path p) {
        String name = p.getFileName().toString().toLowerCase();
        for (String ext : extensions) {
            if (name.endsWith(ext)) return true;
        }
        return false;
    }

    private String[] parseExtensions(String csv) {
        String[] parts = csv.split(",");
        for (int i = 0; i < parts.length; i++) {
            parts[i] = parts[i].trim().toLowerCase();
            if (!parts[i].startsWith(".")) parts[i] = "." + parts[i];
        }
        return parts;
    }

    private static class Result {
        int imgsFound;
        int imgsFixed;
        boolean written;
    }

    private Result processSingleFile(Path file, Path baseInputDir) throws IOException {
        Result result = new Result();
        String content = Files.readString(file, StandardCharsets.UTF_8);

        // Trova commenti
        List<int[]> commentRanges = new ArrayList<>();
        Matcher commentMatcher = HTML_COMMENT_PATTERN.matcher(content);
        while (commentMatcher.find()) {
            commentRanges.add(new int[]{commentMatcher.start(), commentMatcher.end()});
        }

        Matcher m = IMG_TAG_PATTERN.matcher(content);
        StringBuffer sb = new StringBuffer();
        boolean anyChange = false;
        int foundCount = 0;
        int fixedCount = 0;

        while (m.find()) {
            foundCount++;
            int start = m.start();
            if (isInsideRanges(start, commentRanges)) {
                // dentro commento -> lascialo
                m.appendReplacement(sb, Matcher.quoteReplacement(m.group()));
                continue;
            }

            String tag = m.group();

            // Se è già self-closed non toccare
            if (tag.matches("(?s).*?/\\s*>\\s*$")) {
                m.appendReplacement(sb, Matcher.quoteReplacement(tag));
                continue;
            }

            // Protezione: se dopo compare </img> nelle prox 200 char -> skip
            int searchFrom = m.end();
            int searchTo = Math.min(content.length(), searchFrom + 200);
            boolean hasClosingImg = false;
            if (searchFrom < searchTo) {
                String after = content.substring(searchFrom, searchTo).toLowerCase();
                if (after.contains("</img")) {
                    hasClosingImg = true;
                }
            }
            if (hasClosingImg) {
                m.appendReplacement(sb, Matcher.quoteReplacement(tag));
                continue;
            }

            // Trasforma in self-closed
            String replacement = tag.substring(0, tag.length() - 1) + " />";
            m.appendReplacement(sb, Matcher.quoteReplacement(replacement));
            anyChange = true;
            fixedCount++;
            if (debug) {
                System.out.println("  -> Fix tag in " + file + " : " + tag + "  ->  " + replacement);
            }
        }
        m.appendTail(sb);

        // Calcola percorso relativo in modo robusto
        Path rel;
        if (baseInputDir == null) {
            rel = file.getFileName();
        } else {
            try {
                rel = baseInputDir.relativize(file);
            } catch (IllegalArgumentException e) {
                rel = file.getFileName();
            }
        }
        Path targetPath = outputDir.resolve(rel);

        // Assicura la directory
        Path parent = targetPath.getParent();
        if (parent != null) Files.createDirectories(parent);

        // Cosa scrivere
        String toWrite = anyChange ? sb.toString() : content;
        boolean written = false;
        if (anyChange || alwaysSave) {
            Files.writeString(targetPath, toWrite, StandardCharsets.UTF_8, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            written = true;
            System.out.println((anyChange ? "Corretto: " : "Copiato: ") + file + " -> " + targetPath + " (img trovati: " + foundCount + ", corretti: " + fixedCount + ")");
        } else {
            // se non scriviamo ma vogliamo comunque segnalare
            System.out.println("Nessuna modifica per: " + file + " (img trovati: " + foundCount + ", corretti: " + fixedCount + ")");
        }

        result.imgsFound = foundCount;
        result.imgsFixed = fixedCount;
        result.written = written;
        return result;
    }

    private boolean isInsideRanges(int index, List<int[]> ranges) {
        if (ranges == null || ranges.isEmpty()) return false;
        for (int[] r : ranges) {
            if (index >= r[0] && index < r[1]) return true;
        }
        return false;
    }

    public static void main(String[] args) {
        int exitCode = new CommandLine(new ImgSelfCloser()).execute(args);
        System.exit(exitCode);
    }
}
