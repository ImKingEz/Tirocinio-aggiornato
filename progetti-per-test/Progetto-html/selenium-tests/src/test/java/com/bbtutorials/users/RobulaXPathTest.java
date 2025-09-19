package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;

public class RobulaXPathTest extends BaseTest {
  @Test
  public void testContactFormRobulaXPath() throws Exception {
    driver.findElement(By.xpath("//*[@type='text']")).click();
    driver.findElement(By.xpath("//*[@type='text']")).clear();
    driver.findElement(By.xpath("//*[@type='text']")).sendKeys("calcio");

    driver.findElement(By.xpath("//*[@id='sortby']")).click();
    new Select(driver.findElement(By.xpath("//*[@id='sortby']"))).selectByVisibleText("data di upload");

    driver.findElement(By.xpath("//*[@id='sortorder']")).click();
    new Select(driver.findElement(By.xpath("//*[@id='sortorder']"))).selectByVisibleText("crescente");

    driver.findElement(By.xpath("//*[@id='limit']")).click();
    new Select(driver.findElement(By.xpath("//*[@id='limit']"))).selectByVisibleText("4");

    driver.findElement(By.xpath("//*[@type='reset']")).click();
    
    driver.findElement(By.xpath("//*[@type='submit']")).click();
  }
}