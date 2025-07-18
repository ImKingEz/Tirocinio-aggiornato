package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class KatalonXPathTest extends BaseTest {
  @Test
  public void testUserCreationKatalonXPath() throws Exception {
    driver.findElement(By.xpath("//input[@id='exampleInputEmail1']")).click();
    driver.findElement(By.xpath("//input[@id='exampleInputEmail1']")).clear();
    driver.findElement(By.xpath("//input[@id='exampleInputEmail1']")).sendKeys("s");

    driver.findElement(By.xpath("//input[@id='exampleInputPassword1']")).click();
    driver.findElement(By.xpath("//input[@id='exampleInputPassword1']")).clear();
    driver.findElement(By.xpath("//input[@id='exampleInputPassword1']")).sendKeys("s");

    driver.findElement(By.xpath("//div[2]/div/input")).click();
    driver.findElement(By.xpath("//div[2]/div/input")).clear();
    driver.findElement(By.xpath("//div[2]/div/input")).sendKeys("s");
    
    driver.findElement(By.xpath("//button[@type='submit']")).click();
    
    driver.findElement(By.xpath("(.//*[normalize-space(text()) and normalize-space(.)='Users Created'])[1]/following::button[1]")).click();
  }
}