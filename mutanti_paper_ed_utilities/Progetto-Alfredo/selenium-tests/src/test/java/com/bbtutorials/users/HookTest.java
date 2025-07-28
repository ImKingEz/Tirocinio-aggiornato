package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class HookTest extends BaseTest {

  @Test
  public void testContactFormWithHooks() throws Exception {
    driver.get("http://localhost:4200/");
    driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-9]//*[@x-test-tpl-div-1]//*[@x-test-hook-main-3]//*[@x-test-tpl-section-1]//*[@x-test-hook-input-19]")).click();
    driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-9]//*[@x-test-tpl-div-1]//*[@x-test-hook-main-3]//*[@x-test-tpl-section-1]//*[@x-test-hook-input-19]")).clear();
    driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-9]//*[@x-test-tpl-div-1]//*[@x-test-hook-main-3]//*[@x-test-tpl-section-1]//*[@x-test-hook-input-19]")).sendKeys("calcio,passione");

    driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-9]//*[@x-test-tpl-div-1]//*[@x-test-hook-main-3]//*[@x-test-tpl-section-1]//*[@x-test-hook-select-38]")).click();
    new Select(driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-9]//*[@x-test-tpl-div-1]//*[@x-test-hook-main-3]//*[@x-test-tpl-section-1]//*[@x-test-hook-select-38]"))).selectByVisibleText("crescente");
    
    driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-9]//*[@x-test-tpl-div-1]//*[@x-test-hook-main-3]//*[@x-test-tpl-section-1]//*[@x-test-hook-button-55]")).click();
  }
}