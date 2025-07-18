package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class KatalonXPathTest extends BaseTest {
  @Test
  public void testContactFormKatalonXPath() throws Exception {
    // Campo Nome (usa id e label)
    driver.findElement(By.xpath("//label[normalize-space()='Nome:']/following-sibling::input[@id='name']")).click();
    driver.findElement(By.xpath("//label[normalize-space()='Nome:']/following-sibling::input[@id='name']")).clear();
    driver.findElement(By.xpath("//label[normalize-space()='Nome:']/following-sibling::input[@id='name']")).sendKeys("KatalonNome");

    // Campo Email (usa id e label)
    driver.findElement(By.xpath("//label[normalize-space()='Email:']/following-sibling::input[@id='email']")).click();
    driver.findElement(By.xpath("//label[normalize-space()='Email:']/following-sibling::input[@id='email']")).clear();
    driver.findElement(By.xpath("//label[normalize-space()='Email:']/following-sibling::input[@id='email']")).sendKeys("katalon@example.com");

    // Bottone "Invia Messaggio" (usa testo e type)
    driver.findElement(By.xpath("//button[@type='submit' and normalize-space()='Invia Messaggio']")).click();
  }
}