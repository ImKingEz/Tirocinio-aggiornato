package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class AbsoluteXPathTest extends BaseTest {
  @Test
  public void testContactFormAbsoluteXPath() throws Exception {
    driver.get("http://localhost:4200/");

    driver.findElement(By.xpath("/html/body/app-root/app-navbar/nav/div[2]/div/a[2]")).click();

    driver.findElement(By.xpath("/html/body/app-root/app-navbar/nav/div[2]/div/a[1]")).click();

    driver.findElement(By.xpath("/html/body/app-root/app-navbar/nav/div/div[2]/app-search/form/div/input")).click();
    driver.findElement(By.xpath("/html/body/app-root/app-navbar/nav/div/div[2]/app-search/form/div/input")).clear();
    driver.findElement(By.xpath("/html/body/app-root/app-navbar/nav/div/div[2]/app-search/form/div/input")).sendKeys("test");

    driver.findElement(By.xpath("/html/body/app-root/app-navbar/nav/div/div[2]/app-search/form/div[2]/button[2]")).click();
  }
}