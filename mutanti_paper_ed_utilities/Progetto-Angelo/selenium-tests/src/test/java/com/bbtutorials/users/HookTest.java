package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class HookTest extends BaseTest {

  @Test
  public void testContactFormWithHooks() throws Exception {
    // Daily
    driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-9]//*[@x-test-tpl-div-1]//*[@x-test-hook-app-nav-2]//*[@x-test-tpl-nav-1]//*[@x-test-hook-a-12]")).click();
    // Home
    driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-9]//*[@x-test-tpl-div-1]//*[@x-test-hook-app-nav-2]//*[@x-test-tpl-nav-1]//*[@x-test-hook-a-9]")).click();

    // Clicca e inserisci test nella ricerca
    driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-9]//*[@x-test-tpl-div-1]//*[@x-test-hook-app-nav-2]//*[@x-test-tpl-nav-1]//*[@x-test-hook-app-search-6]//*[@x-test-tpl-form-1]//*[@x-test-hook-input-4]")).click();
    driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-9]//*[@x-test-tpl-div-1]//*[@x-test-hook-app-nav-2]//*[@x-test-tpl-nav-1]//*[@x-test-hook-app-search-6]//*[@x-test-tpl-form-1]//*[@x-test-hook-input-4]")).clear();
    driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-9]//*[@x-test-tpl-div-1]//*[@x-test-hook-app-nav-2]//*[@x-test-tpl-nav-1]//*[@x-test-hook-app-search-6]//*[@x-test-tpl-form-1]//*[@x-test-hook-input-4]")).sendKeys("test");

    // Clicca cerca
    driver.findElement(By.xpath("//*[@x-test-tpl-html-1]//*[@x-test-hook-app-root-9]//*[@x-test-tpl-div-1]//*[@x-test-hook-app-nav-2]//*[@x-test-tpl-nav-1]//*[@x-test-hook-app-search-6]//*[@x-test-tpl-form-1]//*[@x-test-hook-button-12]")).click();
  }
}