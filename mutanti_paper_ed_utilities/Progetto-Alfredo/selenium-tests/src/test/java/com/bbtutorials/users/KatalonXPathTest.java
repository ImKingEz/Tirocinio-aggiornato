package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;

public class KatalonXPathTest extends BaseTest {
  @Test
  public void testContactFormKatalonXPath() throws Exception {
    driver.get("http://localhost:4200/");

    driver.findElement(By.xpath("//input[@id='tagsQuery']")).click();
    driver.findElement(By.xpath("//input[@id='tagsQuery']")).clear();
    driver.findElement(By.xpath("//input[@id='tagsQuery']")).sendKeys("calcio,passione");

    driver.findElement(By.xpath("//select[@id='sortorder']")).click();
    new Select(driver.findElement(By.xpath("//select[@id='sortorder']"))).selectByVisibleText("crescente");
    
    driver.findElement(By.xpath("//button[@id='reset-filters-button']")).click();
  }
}