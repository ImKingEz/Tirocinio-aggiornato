import { test, expect } from '@playwright/test';

test('Utente si registra correttamente', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.getByTestId('nav-signup').click();
  await expect(page).toHaveURL('/signup', { timeout: 15000 });

  const randomSuffix = Date.now().toString().slice(-6); 
  const uniqueUsername = `user${randomSuffix}`; 
  await page.getByTestId('signup-username-input').fill(uniqueUsername);
  await page.getByTestId('signup-password-input').fill('Password3');
  await page.getByTestId('signup-submit-button').click();

  await expect(page).toHaveURL('/login', { timeout: 15000 });
});

test('Utente prova a registrarsi inserendo nel username 2 caratteri', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.getByTestId('nav-signup').click();
  await expect(page).toHaveURL('/signup', { timeout: 15000 });

  await page.getByTestId('signup-username-input').fill('ab');
  await page.getByTestId('signup-password-input').fill('Password3');

  const form = page.getByTestId('signup-form');
  await expect(form).toContainText("L'username deve contenere almeno 3 caratteri.");
  await expect(page.getByTestId('signup-submit-button')).toBeDisabled();
});

test('Utente prova a registrarsi non includendo nella password un numero', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.getByTestId('nav-signup').click();
  await expect(page).toHaveURL('/signup', { timeout: 15000 });

  await page.getByTestId('signup-username-input').fill('utentevalido');
  await page.getByTestId('signup-password-input').fill('PasswordSenzaNumeri');

  const form = page.getByTestId('signup-form');
  await expect(form).toContainText('La password deve contenere almeno un numero.');
  await expect(page.getByTestId('signup-submit-button')).toBeDisabled();
});