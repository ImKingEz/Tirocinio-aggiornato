package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class RelativeXPathTest extends BaseTest {
  @Test
  public void testContactFormRelativeXPath() throws Exception {
    driver.findElement(By.xpath("//a[@routerLink='/daily']")).click();

    driver.findElement(By.xpath("//a[@routerLink='/home']")).click();

    driver.findElement(By.xpath("//input[@placeholder='Cerca su MemeMuseum']")).click();
    driver.findElement(By.xpath("//input[@placeholder='Cerca su MemeMuseum']")).clear();
    driver.findElement(By.xpath("//input[@placeholder='Cerca su MemeMuseum']")).sendKeys("test");

    driver.findElement(By.xpath("//form//button[@type='submit' and contains(text(), 'Cerca')]")).click();
  }
}