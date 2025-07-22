package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class RobulaXPathTest extends BaseTest {
  @Test
  public void testContactFormRobulaXPath() throws Exception {
    driver.findElement(By.xpath("//label[contains(text(),'Nome:')]/input")).click();
    driver.findElement(By.xpath("//label[contains(text(),'Nome:')]/input")).clear();
    driver.findElement(By.xpath("//label[contains(text(),'Nome:')]/input")).sendKeys("RobulaNome");

    driver.findElement(By.xpath("//label[contains(text(),'Email:')]/input']")).click(); // Assumendo sia il secondo form-group
    driver.findElement(By.xpath("//label[contains(text(),'Email:')]/input']]")).clear();
    driver.findElement(By.xpath("//label[contains(text(),'Email:')]/input']")).sendKeys("robula@example.com");

    driver.findElement(By.xpath("//button[text()='Invia Messaggio']")).click();
  }
}