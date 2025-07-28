package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;

public class SeleniumXPathTest extends BaseTest {
  @Test
  public void testContactFormSeleniumXPath() throws Exception {
    driver.get("http://localhost:4200/");

    driver.findElement(By.xpath("//div[2]/div/input")).click();
    driver.findElement(By.xpath("//div[2]/div/input")).clear();
    driver.findElement(By.xpath("//div[2]/div/input")).sendKeys("calcio,passione");

    driver.findElement(By.xpath("//select[@id='sortorder']")).click();
    new Select(driver.findElement(By.xpath("//select[@id='sortorder']"))).selectByVisibleText("crescente");
    
    driver.findElement(By.xpath("//div/div[2]/div[2]/button")).click();
  }
}