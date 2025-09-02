package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class SeleniumXPathTest extends BaseTest {
  @Test
  public void testContactFormSeleniumXPath() throws Exception {
    // Campo Nome (usa id)
    driver.findElement(By.id("name")).click();
    driver.findElement(By.id("name")).clear();
    driver.findElement(By.id("name")).sendKeys("SeleniumNome");

    // Campo Email (usa id)
    driver.findElement(By.id("email")).click();
    driver.findElement(By.id("email")).clear();
    driver.findElement(By.id("email")).sendKeys("selenium@example.com");

    // Bottone "Invia Messaggio" (usa CSS Selector)
    driver.findElement(By.cssSelector("button[type='submit']")).click();
  }
}