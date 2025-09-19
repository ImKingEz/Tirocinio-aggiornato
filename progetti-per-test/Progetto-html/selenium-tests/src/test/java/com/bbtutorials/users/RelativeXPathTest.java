package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;

public class RelativeXPathTest extends BaseTest {
  @Test
  public void testContactFormRelativeXPath() throws Exception {
    By tagsInput = By.xpath(
      "//div[contains(@class, 'search-sub-block')][1]/div/div[2]/div/input"
    );
    driver.findElement(tagsInput).click();
    driver.findElement(tagsInput).clear();
    driver.findElement(tagsInput).sendKeys("calcio");

    By sortBy = By.xpath(
      "//div[contains(@class, 'search-sub-block')][2]/div/div[1]/div/select"
    );
    driver.findElement(sortBy).click();
    new Select(driver.findElement(sortBy)).selectByVisibleText("data di upload");

    By sortOrder = By.xpath(
      "//div[contains(@class, 'search-sub-block')][2]/div/div[2]/div/select"
    );
    driver.findElement(sortOrder).click();
    new Select(driver.findElement(sortOrder)).selectByVisibleText("crescente");

    By limit = By.xpath(
      "//div[contains(@class, 'search-sub-block')][2]/div/div[3]/div/select"
    );
    driver.findElement(limit).click();
    new Select(driver.findElement(limit)).selectByVisibleText("4");

    By resetButton = By.xpath(
      "//div[contains(@class, 'search-sub-block')][2]/div[2]/button"
    );
    driver.findElement(resetButton).click();

    By submitButton = By.xpath("//form/div[2]/div/button");
    driver.findElement(submitButton).click();
  }
}
