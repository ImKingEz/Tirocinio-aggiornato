import { test, expect } from '@playwright/test';

test('Login da parte di un utente effettuato con successo', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.getByTestId('nav-login').click();
  
  await expect(page).toHaveURL('/login', { timeout: 15000 });
  
  await page.getByTestId('login-username-input').fill('alessandro');
  await page.getByTestId('login-password-input').fill('Alessandro3');
  await page.getByTestId('login-submit-button').click();
  
  await expect(page.getByTestId('navbar')).toContainText('@alessandro', { timeout: 15000 });
});

test('Utente prova a fare il login inserendo nel username solo spazi vuoti', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.getByTestId('nav-login').click();
  await expect(page).toHaveURL('/login', { timeout: 15000 });

  await page.getByTestId('login-username-input').fill('   ');
  await page.getByTestId('login-password-input').fill('Password3');

  const form = page.getByTestId('login-form');
  
  await expect(form).toContainText('Non si possono inserire solo spazi vuoti.');
  await expect(page.getByTestId('login-submit-button')).toBeDisabled();
});