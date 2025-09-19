package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class KatalonXPathTest extends BaseTest {
  @Test
  public void testContactFormKatalonXPath() throws Exception {
    // Daily
    driver.findElement(By.xpath("//a[contains(@href, '/daily')]")).click();
    // Home
    driver.findElement(By.xpath("//a[contains(@href, '/home')]")).click();

    // Clicca e inserisci test nella ricerca
    driver.findElement(By.xpath("//input[@name='tags']")).click();
    driver.findElement(By.xpath("//input[@name='tags']")).clear();
    driver.findElement(By.xpath("//input[@name='tags']")).sendKeys("test");

    // Clicca cerca
    driver.findElement(By.xpath("//button[@type='submit']")).click();
  }
}