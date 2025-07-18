package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class RelativeXPathTest extends BaseTest {
  @Test
  public void testUserCreationRelativeXPath() throws Exception {
    driver.findElement(By.xpath("//input[@formControlName='firstName']")).click();
    driver.findElement(By.xpath("//input[@formControlName='firstName']")).clear();
    driver.findElement(By.xpath("//input[@formControlName='firstName']")).sendKeys("RelativeFN");

    driver.findElement(By.xpath("//input[@formControlName='lastName']")).click();
    driver.findElement(By.xpath("//input[@formControlName='lastName']")).clear();
    driver.findElement(By.xpath("//input[@formControlName='lastName']")).sendKeys("RelativeLN");

    driver.findElement(By.xpath("//input[@formControlName='email']")).click();
    driver.findElement(By.xpath("//input[@formControlName='email']")).clear();
    driver.findElement(By.xpath("//input[@formControlName='email']")).sendKeys("relative@example.com");

    driver.findElement(By.xpath("//button[@type='submit' and contains(text(), 'Create')]")).click();

    driver.findElement(By.xpath("//app-display-board//button[contains(text(),'Get All Users')]")).click();
  }
}