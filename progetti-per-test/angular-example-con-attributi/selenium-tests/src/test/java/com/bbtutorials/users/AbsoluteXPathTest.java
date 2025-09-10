package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class AbsoluteXPathTest extends BaseTest {
  @Test
  public void testContactFormAbsoluteXPath() throws Exception {
    // Campo Nome
    driver.findElement(By.xpath("/html/body/app-root/div[1]/app-contact-form[1]/div[1]/form[1]/div[1]/input[1]")).click();
    driver.findElement(By.xpath("/html/body/app-root/div[1]/app-contact-form[1]/div[1]/form[1]/div[1]/input[1]")).clear();
    driver.findElement(By.xpath("/html/body/app-root/div[1]/app-contact-form[1]/div[1]/form[1]/div[1]/input[1]")).sendKeys("AbsoluteFN");

    // Campo Email
    driver.findElement(By.xpath("/html/body/app-root/div[1]/app-contact-form[1]/div[1]/form[1]/div[2]/input[1]")).click();
    driver.findElement(By.xpath("/html/body/app-root/div[1]/app-contact-form[1]/div[1]/form[1]/div[2]/input[1]")).clear();
    driver.findElement(By.xpath("/html/body/app-root/div[1]/app-contact-form[1]/div[1]/form[1]/div[2]/input[1]")).sendKeys("absolute@example.com");

    // Bottone "Invia Messaggio"
    driver.findElement(By.xpath("/html/body/app-root/div[1]/app-contact-form[1]/div[1]/form[1]/button[1]")).click();
  }
}