package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;

public class HookTest extends BaseTest {

  @Test
  public void testContactFormWithHooks() throws Exception {
    driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-8]//*[@x-test-tpl-main-1]//*[@x-test-hook-input-20]")).click();
    driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-8]//*[@x-test-tpl-main-1]//*[@x-test-hook-input-20]")).clear();
    driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-8]//*[@x-test-tpl-main-1]//*[@x-test-hook-input-20]")).sendKeys("calcio");

    driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-8]//*[@x-test-tpl-main-1]//*[@x-test-hook-select-28]")).click();
    new Select(driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-8]//*[@x-test-tpl-main-1]//*[@x-test-hook-select-28]"))).selectByVisibleText("data di upload");

    driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-8]//*[@x-test-tpl-main-1]//*[@x-test-hook-select-39]")).click();
    new Select(driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-8]//*[@x-test-tpl-main-1]//*[@x-test-hook-select-39]"))).selectByVisibleText("crescente");

    driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-8]//*[@x-test-tpl-main-1]//*[@x-test-hook-select-49]")).click();
    new Select(driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-8]//*[@x-test-tpl-main-1]//*[@x-test-hook-select-49]"))).selectByVisibleText("4");

    driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-8]//*[@x-test-tpl-main-1]//*[@x-test-hook-button-61]")).click();

    driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-8]//*[@x-test-tpl-main-1]//*[@x-test-hook-button-64]")).click();
  }
}