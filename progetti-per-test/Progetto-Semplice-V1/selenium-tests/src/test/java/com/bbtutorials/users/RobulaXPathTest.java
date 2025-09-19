package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class RobulaXPathTest extends BaseTest {
  @Test
  public void testContactFormRobulaXPath() throws Exception {
    driver.findElement(By.xpath("//input[@id='name']")).click();
    driver.findElement(By.xpath("//input[@id='name']")).clear();
    driver.findElement(By.xpath("//input[@id='name']")).sendKeys("RobulaNome");

    driver.findElement(By.xpath("//input[@id='email']")).click();
    driver.findElement(By.xpath("//input[@id='email']")).clear();
    driver.findElement(By.xpath("//input[@id='email']")).sendKeys("robula@example.com");

    driver.findElement(By.xpath("//div[@class='form-container']//button[@type='submit']")).click();
  }
}