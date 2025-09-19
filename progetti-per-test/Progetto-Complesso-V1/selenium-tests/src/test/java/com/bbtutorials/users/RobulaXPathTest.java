package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;

public class RobulaXPathTest extends BaseTest {
  @Test
  public void testContactFormRobulaXPath() throws Exception {
   
    driver.findElement(By.xpath("//input[@id='tagsQuery']")).click();
    driver.findElement(By.xpath("//input[@id='tagsQuery']")).clear();
    driver.findElement(By.xpath("//input[@id='tagsQuery']")).sendKeys("calcio, passione");

    Select sortOrderSelect = new Select(driver.findElement(By.xpath("//select[@id='sortorder']")));
    sortOrderSelect.selectByVisibleText("crescente");

    driver.findElement(By.xpath("//button[@id='reset-filters-button']")).click();
  }
}