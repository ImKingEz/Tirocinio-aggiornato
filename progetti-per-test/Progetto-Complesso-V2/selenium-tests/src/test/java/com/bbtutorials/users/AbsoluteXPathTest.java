package com.bbtutorials.users;

import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class AbsoluteXPathTest extends BaseTest {
  @Test
  public void testContactFormAbsoluteXPath() throws Exception {
    driver.get("http://localhost:4200/");

    // Clicca sul link "Daily Meme"
    driver.findElement(By.xpath("/html/body/app-root/div/app-nav/nav/div[2]/div[1]/a[2]")).click();

    // Clicca sul link "Home"
    driver.findElement(By.xpath("/html/body/app-root/div/app-nav/nav/div[2]/div[1]/a[1]")).click();

    // Interagisce con il campo di ricerca
    driver.findElement(By.xpath("/html/body/app-root/div/app-nav/nav/div[1]/div[2]/app-search/form/div[1]/input")).click();
    driver.findElement(By.xpath("/html/body/app-root/div/app-nav/nav/div[1]/div[2]/app-search/form/div[1]/input")).clear();
    driver.findElement(By.xpath("/html/body/app-root/div/app-nav/nav/div[1]/div[2]/app-search/form/div[1]/input")).sendKeys("test");

    // Clicca sul pulsante "Cerca"
    driver.findElement(By.xpath("/html/body/app-root/div/app-nav/nav/div[1]/div[2]/app-search/form/div[2]/button[2]")).click();
  }
}