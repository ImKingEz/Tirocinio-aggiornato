package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class SeleniumXPathTest extends BaseTest {
  @Test
  public void testContactFormSeleniumXPath() throws Exception {
    driver.findElement(By.xpath("//input[@name='name']")).click();
    driver.findElement(By.xpath("//input[@name='name']")).clear();
    driver.findElement(By.xpath("//input[@name='name']")).sendKeys("SeleniumNome");

    driver.findElement(By.xpath("//div[2]/label/input")).click();
    driver.findElement(By.xpath("//div[2]/label/input")).clear();
    driver.findElement(By.xpath("//div[2]/label/input")).sendKeys("selenium@example.com");

    driver.findElement(By.xpath("//button[contains(.,'Invia Messaggio')]")).click();
  }
}