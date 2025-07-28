package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;

public class RelativeXPathTest extends BaseTest {
  @Test
  public void testContactFormRelativeXPath() throws Exception {
    driver.findElement(By.xpath("//input[@id='tagsQuery']")).click();
    driver.findElement(By.xpath("//input[@id='tagsQuery']")).clear();
    driver.findElement(By.xpath("//input[@id='tagsQuery']")).sendKeys("calcio, passione");

    Select sortOrderSelect = new Select(driver.findElement(By.xpath("//label[text()='Ordina in modo']/following-sibling::div/select")));
    sortOrderSelect.selectByVisibleText("crescente");

    driver.findElement(By.xpath("//button[contains(text(), 'Resetta Filtri')]")).click();
  }
}