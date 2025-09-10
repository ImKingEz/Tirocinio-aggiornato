package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;

public class AbsoluteXPathTest extends BaseTest {
  @Test
  public void testContactFormAbsoluteXPath() throws Exception {
    driver.findElement(By.xpath("/html/body/app-root/div/main/app-home-page/section/form/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/input")).click();
    driver.findElement(By.xpath("/html/body/app-root/div/main/app-home-page/section/form/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/input")).clear();
    driver.findElement(By.xpath("/html/body/app-root/div/main/app-home-page/section/form/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/input")).sendKeys("calcio, passione");

    Select sortOrderSelect = new Select(driver.findElement(By.xpath("/html/body/app-root/div/main/app-home-page/section/form/div[1]/div[1]/div[2]/div[1]/div[2]/div[1]/select")));
    sortOrderSelect.selectByVisibleText("crescente");

    driver.findElement(By.xpath("/html/body/app-root/div/main/app-home-page/section/form/div[2]/div[1]/button")).click();
  }
}