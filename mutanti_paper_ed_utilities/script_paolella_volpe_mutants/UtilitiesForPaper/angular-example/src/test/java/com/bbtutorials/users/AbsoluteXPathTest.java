package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class AbsoluteXPathTest extends BaseTest {
  @Test
  public void testUserCreationAbsoluteXPath() throws Exception {
    driver.findElement(By.xpath("/html/body/app-root/div/div/div[1]/div[1]/form/div[1]/div[1]/input")).click();
    driver.findElement(By.xpath("/html/body/app-root/div/div/div[1]/div[1]/form/div[1]/div[1]/input")).clear();
    driver.findElement(By.xpath("/html/body/app-root/div/div/div[1]/div[1]/form/div[1]/div[1]/input")).sendKeys("AbsoluteFN");

    driver.findElement(By.xpath("/html/body/app-root/div/div/div[1]/div[1]/form/div[1]/div[2]/input")).click();
    driver.findElement(By.xpath("/html/body/app-root/div/div/div[1]/div[1]/form/div[1]/div[2]/input")).clear();
    driver.findElement(By.xpath("/html/body/app-root/div/div/div[1]/div[1]/form/div[1]/div[2]/input")).sendKeys("AbsoluteLN");

    driver.findElement(By.xpath("/html/body/app-root/div/div/div[1]/div[1]/form/div[2]/div/input")).click();
    driver.findElement(By.xpath("/html/body/app-root/div/div/div[1]/div[1]/form/div[2]/div/input")).clear();
    driver.findElement(By.xpath("/html/body/app-root/div/div/div[1]/div[1]/form/div[2]/div/input")).sendKeys("absolute@example.com");

    driver.findElement(By.xpath("/html/body/app-root/div/div/div[1]/div[1]/form/button")).click();

    driver.findElement(By.xpath("/html/body/app-root/div/div/div[1]/div[2]/app-display-board/div/div[3]/button")).click();
  }
}