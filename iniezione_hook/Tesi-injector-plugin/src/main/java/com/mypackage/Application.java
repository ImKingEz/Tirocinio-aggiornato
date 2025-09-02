package com.mypackage;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Application {

    public static void main(String[] args){
//        String[] args = new String[5];
//        args[0] = ".html";
//        args[1] = "angularjs";
//        args[2] = "C:\\Users\\volpe\\OneDrive\\Desktop\\Generazione-hook\\insert-here-your-web-app\\angular-java-example\\src\\main\\ui";

        System.out.println("Inizio");
        Path start = Paths.get(args[2]);
        String batchFileName = "hookInjection.bat";

        // Ottieni la directory corrente dell'applicazione Java
        String currentWorkingDir = System.getProperty("user.dir");
        Path batchFilePath = Paths.get(currentWorkingDir, batchFileName);

        try {
            Stream<Path> streamPath = Files.walk(start, Integer.MAX_VALUE);
            List<String> filePathList = streamPath
                    .map(String::valueOf)
                    .sorted()
                    .collect(Collectors.toList());
            //ottenere lista di file di FE
            List<String> feFilePathList = filePathList
                    .stream()
                    .filter(fileName -> fileName.contains(args[0]))
                    .collect(Collectors.toList());

            System.out.println("La lista dei file di FE è:");
            System.out.println(feFilePathList);
            List<String> commmandList = createHookInjectionContent(feFilePathList, args[1]);
            commmandList.add(0,"cd ..\\test-hooks\\test-guard");
            System.out.println("La lista dei comandi da inserire nel file hookInjection.bat:");
            System.out.println(commmandList);

            //Creare file hookInjection.bat
            FileWriter myWriter = new FileWriter(batchFilePath.toFile());
            commmandList.forEach(feFile -> {
                try {
                    myWriter.write(feFile+"\n");
                } catch (IOException e) {
                    e.printStackTrace();
                }
            });
            System.out.println("Successfully wrote to the file.");
            myWriter.close();

            try{
                ProcessBuilder pb = new ProcessBuilder();
                pb.command("cmd.exe", "/c", batchFilePath.toString());
                pb.redirectErrorStream(true);
                Process p = pb.start();
                int exitCode = p.waitFor();
                System.out.println("Script executed with exit code: " + exitCode);
            }catch(Exception e){
                e.printStackTrace();
            }

        } catch (IOException e) {
            e.printStackTrace();
        }


    }


    public static List<String> createHookInjectionContent(List<String> fileFeList, String grammarType){
        List<String> commandList = new ArrayList<>();
        fileFeList.forEach(
                content -> {
                    content = "node main.js inject-hooks "
                            + "\"" + content + "\""
                            + " --grammar "
                            + grammarType;
                    commandList.add(content);
                }
        );
        return commandList;
    }

}
