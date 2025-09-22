package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;

public class SeleniumXPathTest extends BaseTest {
  @Test
  public void testContactFormSeleniumXPath() throws Exception {
    driver.findElement(By.id("tagsQuery")).clear();
    driver.findElement(By.id("tagsQuery")).sendKeys("calcio");

    driver.findElement(By.cssSelector("#sortby")).click();
    new Select(driver.findElement(By.cssSelector("#sortby"))).selectByVisibleText("data di upload");

    driver.findElement(By.xpath("//select[@id='sortorder']")).click();
    new Select(driver.findElement(By.xpath("//select[@id='sortorder']"))).selectByVisibleText("crescente");

    driver.findElement(By.xpath("//select[@id='limit']")).click();
    new Select(driver.findElement(By.xpath("//select[@id='limit']"))).selectByVisibleText("4");

    driver.findElement(By.xpath("//button[@id='reset-filters-button']")).click();
    
    driver.findElement(By.xpath("//button[@type='submit']")).click();
  }
}