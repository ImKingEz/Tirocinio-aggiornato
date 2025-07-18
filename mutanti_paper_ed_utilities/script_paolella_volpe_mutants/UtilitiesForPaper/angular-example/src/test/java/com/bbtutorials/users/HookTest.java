package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class HookTest extends BaseTest {

  @Test
  public void testContactFormWithHooks() throws Exception {
    // Campo Nome
    driver.findElement(By.xpath("//*[@x-test-hook-app-contact-form-7]//*[@x-test-hook-form-2]//*[@x-test-hook-input-5]")).click();
    driver.findElement(By.xpath("//*[@x-test-hook-app-contact-form-7]//*[@x-test-hook-form-2]//*[@x-test-hook-input-5]")).clear();
    driver.findElement(By.xpath("//*[@x-test-hook-app-contact-form-7]//*[@x-test-hook-form-2]//*[@x-test-hook-input-5]")).sendKeys("HookNome");

    // Campo Email
    driver.findElement(By.xpath("//*[@x-test-hook-app-contact-form-7]//*[@x-test-hook-form-2]//*[@x-test-hook-input-8]")).click();
    driver.findElement(By.xpath("//*[@x-test-hook-app-contact-form-7]//*[@x-test-hook-form-2]//*[@x-test-hook-input-8]")).clear();
    driver.findElement(By.xpath("//*[@x-test-hook-app-contact-form-7]//*[@x-test-hook-form-2]//*[@x-test-hook-input-8]")).sendKeys("hook@example.com");

    // Bottone "Invia Messaggio"
    driver.findElement(By.xpath("//*[@x-test-hook-app-contact-form-7]//*[@x-test-hook-form-2]//*[@x-test-hook-button-9]")).click();
  }
}