package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class KatalonXPathTest extends BaseTest {
  @Test
  public void testContactFormKatalonXPath() throws Exception {
    // Campo Nome (usa id e label)
    driver.findElement(By.xpath("//input[@id='name']")).click();
    driver.findElement(By.xpath("//input[@id='name']")).clear();
    driver.findElement(By.xpath("//input[@id='name']")).sendKeys("KatalonNome");

    // Campo Email (usa id e label)
    driver.findElement(By.xpath("//input[@id='email']")).click();
    driver.findElement(By.xpath("//input[@id='email']")).clear();
    driver.findElement(By.xpath("//input[@id='email']")).sendKeys("katalon@example.com");

    // Bottone "Invia Messaggio" (usa testo e type)
    driver.findElement(By.xpath("//button[@type='submit']")).click();
  }
}