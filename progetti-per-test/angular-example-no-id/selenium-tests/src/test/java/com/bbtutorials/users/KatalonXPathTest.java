package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class KatalonXPathTest extends BaseTest {
  @Test
  public void testContactFormKatalonXPath() throws Exception {
    driver.findElement(By.xpath("//input[@name='name']")).click();
    driver.findElement(By.xpath("//input[@name='name']")).clear();
    driver.findElement(By.xpath("//input[@name='name']")).sendKeys("KatalonNome");

    driver.findElement(By.xpath("//div[2]/label/input")).click();
    driver.findElement(By.xpath("//div[2]/label/input")).clear();
    driver.findElement(By.xpath("//div[2]/label/input")).sendKeys("katalon@example.com");

    driver.findElement(By.xpath("(.//*[normalize-space(text()) and normalize-space(.)='Email:'])[1]/following::button[1]")).click();
  }
}