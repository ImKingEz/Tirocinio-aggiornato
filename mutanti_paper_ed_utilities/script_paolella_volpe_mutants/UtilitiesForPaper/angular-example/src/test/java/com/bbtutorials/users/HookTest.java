package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class HookTest extends BaseTest {

  @Test
  public void testUserCreationWithHooks() throws Exception {
    driver.findElement(By.xpath("//*[@x-test-tpl-div-2]//*[@x-test-hook-input-10]")).click();
    driver.findElement(By.xpath("//*[@x-test-tpl-div-2]//*[@x-test-hook-input-10]")).clear();
    driver.findElement(By.xpath("//*[@x-test-tpl-div-2]//*[@x-test-hook-input-10]")).sendKeys("s");
    driver.findElement(By.xpath("//*[@x-test-tpl-div-2]//*[@x-test-hook-input-13]")).click();
    driver.findElement(By.xpath("//*[@x-test-tpl-div-2]//*[@x-test-hook-input-13]")).clear();
    driver.findElement(By.xpath("//*[@x-test-tpl-div-2]//*[@x-test-hook-input-13]")).sendKeys("s");
    driver.findElement(By.xpath("//*[@x-test-tpl-div-2]//*[@x-test-hook-input-17]")).click();
    driver.findElement(By.xpath("//*[@x-test-tpl-div-2]//*[@x-test-hook-input-17]")).clear();
    driver.findElement(By.xpath("//*[@x-test-tpl-div-2]//*[@x-test-hook-input-17]")).sendKeys("s");
    driver.findElement(By.xpath("//*[@x-test-tpl-div-2]//*[@x-test-hook-button-18]")).click();
    driver.findElement(By.xpath("//*[@x-test-tpl-div-2]//*[@x-test-hook-app-display-board-20]//*[@x-test-tpl-div-1]//*[@x-test-hook-button-5]")).click();
  }
}