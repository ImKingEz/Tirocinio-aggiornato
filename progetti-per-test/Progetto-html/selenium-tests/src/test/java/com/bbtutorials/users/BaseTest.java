package com.bbtutorials.users;

import org.openqa.selenium.chrome.ChromeOptions;
import java.util.concurrent.TimeUnit;
import org.testng.annotations.*;
import static org.testng.Assert.*;

import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.NoSuchElementException;

public abstract class BaseTest {
  protected WebDriver driver;
  protected String baseUrl;
  protected JavascriptExecutor js;

  @BeforeClass(alwaysRun = true)
  public void setUp() throws Exception {
    System.setProperty("webdriver.chrome.driver", "/usr/local/bin/chromedriver");

    ChromeOptions options = new ChromeOptions();
    options.addArguments("--headless");
    options.addArguments("--disable-gpu");
    options.addArguments("--no-sandbox");
    options.addArguments("--disable-dev-shm-usage");
    options.addArguments("--window-size=1920,1080");

    driver = new ChromeDriver(options);
    baseUrl = "http://localhost:4200/";
    driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);

    js = (JavascriptExecutor) driver;
    driver.get(baseUrl);
  }

  @AfterMethod(alwaysRun = true)
  public void afterTestActions() {
    String locatorType = System.getProperty("locator.type", "unknown_locator");
    String mutantName = System.getProperty("mutant.name", "unknown_mutant.txt");

    String baseFileName = locatorType + "_" + mutantName.replace(".txt", "");

    takeScreenshot(baseFileName);
    dumpDomSource(baseFileName);
  }


  /**
   * Salva uno screenshot della pagina corrente.
   * @param baseFileName Il nome base per il file (es. hook_mutant_alpha)
   */
  protected void takeScreenshot(String baseFileName) {
    String screenshotPath = System.getProperty("screenshot.path", "target/screenshots");
    File screenshotDir = new File(screenshotPath);
    if (!screenshotDir.exists()) {
        screenshotDir.mkdirs();
    }

    String filename = baseFileName.replaceAll("[^a-zA-Z0-9.-]", "_") + ".png";
    File destFile = new File(screenshotDir, filename);

    try {
        if (driver instanceof TakesScreenshot) {
            File scrFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            FileUtils.copyFile(scrFile, destFile);
            System.out.println("Screenshot salvato in: " + destFile.getAbsolutePath());
        }
    } catch (Exception e) {
        System.err.println("Errore durante il salvataggio dello screenshot: " + e.getMessage());
    }
  }

  /**
   * Salva il sorgente completo del DOM corrente (come visto dal browser) in un file HTML.
   * @param baseFileName Il nome base per il file (es. hook_mutant_alpha)
   */
  protected void dumpDomSource(String baseFileName) {
      String domPath = System.getProperty("dom.path", "target/doms");
      File domDir = new File(domPath);
      if (!domDir.exists()) {
          domDir.mkdirs();
      }
      
      String filename = baseFileName.replaceAll("[^a-zA-Z0-9.-]", "_") + ".html";
      File destFile = new File(domDir, filename);

      try {
          String pageSource = (String) js.executeScript("return document.documentElement.outerHTML;");
          try (FileWriter writer = new FileWriter(destFile)) {
              writer.write(pageSource);
          }
          System.out.println("DOM salvato in: " + destFile.getAbsolutePath());
      } catch (Exception e) {
          System.err.println("Errore durante il salvataggio del DOM: " + e.getMessage());
      }
  }


  @AfterClass(alwaysRun = true)
  public void tearDown() throws Exception {
    if (driver != null) {
      driver.quit();
    }
  }

  protected boolean isElementPresent(By by) {
    try {
      driver.findElement(by);
      return true;
    } catch (NoSuchElementException e) {
      return false;
    }
  }
}