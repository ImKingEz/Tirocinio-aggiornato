package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class RobulaXPathTest extends BaseTest {
  @Test
  public void testUserCreationRobulaXPath() throws Exception {
    driver.findElement(By.xpath("//div[@class='form-group col-md-6']/input[@formcontrolname='firstName']")).click();
    driver.findElement(By.xpath("//div[@class='form-group col-md-6']/input[@formcontrolname='firstName']")).clear();
    driver.findElement(By.xpath("//div[@class='form-group col-md-6']/input[@formcontrolname='firstName']")).sendKeys("RobulaFN");

    driver.findElement(By.xpath("//div[@class='form-group col-md-6'][2]/input[@formcontrolname='lastName']")).click();
    driver.findElement(By.xpath("//div[@class='form-group col-md-6'][2]/input[@formcontrolname='lastName']")).clear();
    driver.findElement(By.xpath("//div[@class='form-group col-md-6'][2]/input[@formcontrolname='lastName']")).sendKeys("RobulaLN");

    driver.findElement(By.xpath("//div[@class='form-group col-md-12']/input[@formcontrolname='email']")).click();
    driver.findElement(By.xpath("//div[@class='form-group col-md-12']/input[@formcontrolname='email']")).clear();
    driver.findElement(By.xpath("//div[@class='form-group col-md-12']/input[@formcontrolname='email']")).sendKeys("robula@example.com");

    driver.findElement(By.xpath("//form[@x-test-hook-form-6]/button[@type='submit']")).click();

    driver.findElement(By.xpath("//app-display-board[@x-test-hook-app-display-board-20]//button[contains(@class,'btn-warning') and normalize-space()='Get All Users']")).click();
  }
}