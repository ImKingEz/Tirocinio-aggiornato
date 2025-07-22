package com.bbtutorials.users;

import org.openqa.selenium.chrome.ChromeOptions;
import java.util.concurrent.TimeUnit;
import org.testng.annotations.*;
import static org.testng.Assert.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;

import java.io.File;
import org.apache.commons.io.FileUtils; // Aggiunto per FileUtils
import org.openqa.selenium.OutputType; // Aggiunto per screenshot
import org.openqa.selenium.TakesScreenshot; // Aggiunto per screenshot
import java.io.IOException; // Aggiunto per gestione eccezioni di I/O
import java.text.SimpleDateFormat; // Aggiunto per timestamp screenshot
import java.util.Date; // Aggiunto per timestamp screenshot
import java.util.NoSuchElementException;


public abstract class BaseTest {
  protected WebDriver driver;
  protected String baseUrl;
  protected boolean acceptNextAlert = true; // Potresti volerla rimuovere se non usata
  protected StringBuffer verificationErrors = new StringBuffer(); // Potresti volerla rimuovere se non usata
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

  // Aggiunto metodo per fare screenshot
  protected void takeScreenshot(String testName) {
    String screenshotPath = System.getProperty("screenshot.path", "target/screenshots"); // Fallback
  File screenshotDir = new File(screenshotPath); // Percorso dentro il container
    if (!screenshotDir.exists()) {
        screenshotDir.mkdirs(); // Crea le directory se non esistono
    }

    String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
    String filename = testName.replaceAll("[^a-zA-Z0-9.-]", "_") + "_" + timestamp + ".png"; // Rimuove caratteri non validi per il nome file
    File destFile = new File(screenshotDir, filename);

    try {
        if (driver instanceof TakesScreenshot) { // Verifica che il driver supporti gli screenshot
            File scrFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            FileUtils.copyFile(scrFile, destFile);
            System.out.println("Screenshot salvato in: " + destFile.getAbsolutePath());
        } else {
            System.err.println("Il driver corrente non supporta gli screenshot.");
        }
    } catch (WebDriverException e) {
        System.err.println("Errore WebDriver durante il salvataggio dello screenshot (potrebbe essere browser crashato): " + e.getMessage());
    } catch (IOException e) {
        System.err.println("Errore IO durante il salvataggio dello screenshot: " + e.getMessage());
    }
  }

  // Aggiunta la logica di screenshot nell'AfterMethod di TestNG
  @AfterMethod(alwaysRun = true)
  public void tearDownMethod(org.testng.ITestResult result) {
    if (driver != null && result.getStatus() == org.testng.ITestResult.FAILURE) {
        String testIdentifier = result.getMethod().getMethodName();
        // Se possibile, aggiungi informazioni sul mutante e sul locator type
        // Queste informazioni non sono facilmente accessibili da qui senza passare parametri,
        // ma il nome del metodo è già un buon punto di partenza.
        // Potresti passare il nome del mutante come parametro al metodo test (es. testUserCreationWithHooks(String mutantName))
        // e poi recuperarlo da result.getParameters() se volessi più dettaglio nel nome del file.
        takeScreenshot(testIdentifier);
    }
  }

  @AfterClass(alwaysRun = true)
  public void tearDown() throws Exception {
    if (driver != null) {
      driver.quit();
    }
    String verificationErrorString = verificationErrors.toString();
    if (!"".equals(verificationErrorString)) {
      fail(verificationErrorString);
    }
  }

  // ... (metodi isElementPresent, isAlertPresent, closeAlertAndGetItsText rimangono invariati)
  protected boolean isElementPresent(By by) {
    try {
      driver.findElement(by);
      return true;
    } catch (NoSuchElementException e) {
      return false;
    }
  }

  protected boolean isAlertPresent() {
    try {
      driver.switchTo().alert();
      return true;
    } catch (NoAlertPresentException e) {
      return false;
    }
  }

  protected String closeAlertAndGetItsText() {
    try {
      Alert alert = driver.switchTo().alert();
      String alertText = alert.getText();
      if (acceptNextAlert) {
        alert.accept();
      } else {
        alert.dismiss();
      }
      return alertText;
    } finally {
      acceptNextAlert = true;
    }
  }
}