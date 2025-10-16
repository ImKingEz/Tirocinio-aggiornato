package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;

public class RobulaXPathTest extends BaseTest {
  @Test
  public void testContactFormAbsoluteXPath() throws Exception {
    By tagsInput = By.xpath("//input[@id='tagsQuery']");
    driver.findElement(tagsInput).click();
    driver.findElement(tagsInput).clear();
    driver.findElement(tagsInput).sendKeys("calcio");

    By sortBy = By.xpath("//select[@id='sortby']");
    driver.findElement(sortBy).click();
    new Select(driver.findElement(sortBy)).selectByVisibleText("data di upload");

    By sortOrder = By.xpath("//select[@id='sortorder']");
    driver.findElement(sortOrder).click();
    new Select(driver.findElement(sortOrder)).selectByVisibleText("crescente");

    By limit = By.xpath("//select[@id='limit']");
    driver.findElement(limit).click();
    new Select(driver.findElement(limit)).selectByVisibleText("4");

    By resetButton = By.xpath("//button[@id='reset-filters-button']");
    driver.findElement(resetButton).click();

    By submitButton = By.xpath("//button[@type='submit']");
    driver.findElement(submitButton).click();
  }
}