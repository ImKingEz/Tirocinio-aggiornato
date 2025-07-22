package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class RobulaXPathTest extends BaseTest {
  @Test
  public void testContactFormRobulaXPath() throws Exception {
    // Campo Nome (combina div class e input id)
    driver.findElement(By.xpath("//div[@class='form-group']/input[@id='name']")).click();
    driver.findElement(By.xpath("//div[@class='form-group']/input[@id='name']")).clear();
    driver.findElement(By.xpath("//div[@class='form-group']/input[@id='name']")).sendKeys("RobulaNome");

    // Campo Email (combina div class e input id, usando la posizione se necessario)
    driver.findElement(By.xpath("//div[@class='form-group'][2]/input[@id='email']")).click(); // Assumendo sia il secondo form-group
    driver.findElement(By.xpath("//div[@class='form-group'][2]/input[@id='email']")).clear();
    driver.findElement(By.xpath("//div[@class='form-group'][2]/input[@id='email']")).sendKeys("robula@example.com");

    // Bottone "Invia Messaggio" (usa form hook e type)
    driver.findElement(By.xpath("//form[@x-test-hook-form-2]/button[@type='submit']")).click();
  }
}