package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;

public class KatalonXPathTest extends BaseTest {
  @Test
  public void testContactFormKatalonXPath() throws Exception {
    driver.findElement(By.xpath("//input[@id='tagsQuery']")).click();
    driver.findElement(By.xpath("//input[@id='tagsQuery']")).clear();
    driver.findElement(By.xpath("//input[@id='tagsQuery']")).sendKeys("calcio");

    driver.findElement(By.xpath("//select[@id='sortby']")).click();
    new Select(driver.findElement(By.xpath("//select[@id='sortby']"))).selectByVisibleText("data di upload");

    driver.findElement(By.xpath("//select[@id='sortorder']")).click();
    new Select(driver.findElement(By.xpath("//select[@id='sortorder']"))).selectByVisibleText("crescente");

    driver.findElement(By.xpath("//select[@id='limit']")).click();
    new Select(driver.findElement(By.xpath("//select[@id='limit']"))).selectByVisibleText("4");

    driver.findElement(By.xpath("//button[@id='reset-filters-button']")).click();
    
    driver.findElement(By.xpath("//button[@type='submit']")).click();
  }
}