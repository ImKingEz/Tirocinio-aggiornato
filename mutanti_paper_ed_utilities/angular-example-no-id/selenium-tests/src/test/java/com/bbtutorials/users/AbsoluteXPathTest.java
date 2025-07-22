package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class AbsoluteXPathTest extends BaseTest {
  @Test
  public void testContactFormAbsoluteXPath() throws Exception {
    // Campo Nome
    driver.findElement(By.xpath("/html/body/app-root/div/app-contact-form/div/form/div[1]/label/input")).click();
    driver.findElement(By.xpath("/html/body/app-root/div/app-contact-form/div/form/div[1]/label/input")).clear();
    driver.findElement(By.xpath("/html/body/app-root/div/app-contact-form/div/form/div[1]/label/input")).sendKeys("AbsoluteFN");

    // Campo Email
    driver.findElement(By.xpath("/html/body/app-root/div/app-contact-form/div/form/div[2]/label/input")).click();
    driver.findElement(By.xpath("/html/body/app-root/div/app-contact-form/div/form/div[2]/label/input")).clear();
    driver.findElement(By.xpath("/html/body/app-root/div/app-contact-form/div/form/div[2]/label/input")).sendKeys("absolute@example.com");

    // Bottone "Invia Messaggio"
    driver.findElement(By.xpath("/html/body/app-root/div/app-contact-form/div/form/button")).click();
  }
}