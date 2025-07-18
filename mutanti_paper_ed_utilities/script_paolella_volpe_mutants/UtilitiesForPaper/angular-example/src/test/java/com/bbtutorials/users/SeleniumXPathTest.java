package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class SeleniumXPathTest extends BaseTest {
  @Test
  public void testUserCreationSeleniumXPath() throws Exception {
    driver.findElement(By.xpath("//input[@id='exampleInputEmail1']")).click();
    driver.findElement(By.xpath("//input[@id='exampleInputEmail1']")).clear();
    driver.findElement(By.xpath("//input[@id='exampleInputEmail1']")).sendKeys("s");

    driver.findElement(By.xpath("//input[@id='exampleInputPassword1']")).click();
    driver.findElement(By.xpath("//input[@id='exampleInputPassword1']")).clear();
    driver.findElement(By.xpath("//input[@id='exampleInputPassword1']")).sendKeys("s");

    driver.findElement(By.xpath("(//input[@id='exampleInputEmail1'])[2]")).click();
    driver.findElement(By.xpath("(//input[@id='exampleInputEmail1'])[2]\")")).clear();
    driver.findElement(By.xpath("(//input[@id='exampleInputEmail1'])[2]\")")).sendKeys("s");

    driver.findElement(By.xpath("//button[@type='submit']")).click();

    driver.findElement(By.xpath("//div[2]/button")).click();
  }
}