package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class RobulaXPathTest extends BaseTest {
  @Test
  public void testContactFormRobulaXPath() throws Exception {
    driver.findElement(By.xpath("//a[@aria-label='Vai alla pagina Daily Meme']")).click();

    driver.findElement(By.xpath("//a[@aria-label='Vai alla Homepage']")).click();

    driver.findElement(By.xpath("//input[@formControlName='tags']")).click();
    driver.findElement(By.xpath("//input[@formControlName='tags']")).clear();
    driver.findElement(By.xpath("//input[@formControlName='tags']")).sendKeys("test");

    driver.findElement(By.xpath("//button[@aria-label='Cerca per tag']")).click();
  }
}