package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class SeleniumXPathTest extends BaseTest {
  @Test
  public void testContactFormSeleniumXPath() throws Exception {
    // Daily
    driver.findElement(By.xpath("//a[2]")).click();
    // Home
    driver.findElement(By.xpath("//a")).click();

    // Clicca e inserisci test nella ricerca
    driver.findElement(By.xpath("//input")).click();
    driver.findElement(By.xpath("//input")).clear();
    driver.findElement(By.xpath("//input")).sendKeys("test");

    // Clicca cerca
    driver.findElement(By.xpath("//button[contains(.,'Cerca')]")).click();
  }
}