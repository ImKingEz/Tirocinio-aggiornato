package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class RelativeXPathTest extends BaseTest {
  @Test
  public void testContactFormRelativeXPath() throws Exception {
    // Campo Nome (usa name attribute)
    driver.findElement(By.xpath("//input[@name='name']")).click();
    driver.findElement(By.xpath("//input[@name='name']")).clear();
    driver.findElement(By.xpath("//input[@name='name']")).sendKeys("RelativeNome");

    // Campo Email (usa name attribute)
    driver.findElement(By.xpath("//input[@name='email']")).click();
    driver.findElement(By.xpath("//input[@name='email']")).clear();
    driver.findElement(By.xpath("//input[@name='email']")).sendKeys("relative@example.com");

    // Bottone "Invia Messaggio" (usa testo)
    driver.findElement(By.xpath("//button[contains(text(), 'Invia Messaggio')]")).click();
  }
}