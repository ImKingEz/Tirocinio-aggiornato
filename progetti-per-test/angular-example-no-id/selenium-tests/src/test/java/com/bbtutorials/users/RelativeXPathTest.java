package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class RelativeXPathTest extends BaseTest {
  @Test
  public void testContactFormRelativeXPath() throws Exception {
    driver.findElement(By.xpath("//input[@name='name']")).click();
    driver.findElement(By.xpath("//input[@name='name']")).clear();
    driver.findElement(By.xpath("//input[@name='name']")).sendKeys("RelativeNome");

    driver.findElement(By.xpath("//input[@name='email']")).click();
    driver.findElement(By.xpath("//input[@name='email']")).clear();
    driver.findElement(By.xpath("//input[@name='email']")).sendKeys("relative@example.com");

    driver.findElement(By.xpath("//button[text()='Invia Messaggio']")).click();
  }
}