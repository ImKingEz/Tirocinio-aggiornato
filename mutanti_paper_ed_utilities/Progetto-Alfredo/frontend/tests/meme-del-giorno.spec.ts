import { test, expect } from '@playwright/test';

test('Utente non loggato riceve un errore provando a mettere like ad un meme', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.getByTestId('nav-meme-of-the-day').click();

  await page.getByTestId('meme-card-like-button').click({ timeout: 15000 });

  await expect(page.getByText('Effettua il login per poter interagire con i meme')).toBeVisible({ timeout: 10000 });
});

test('Utente non autenticato dovrebbe vedere un messaggio di errore provando a commentare', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.getByTestId('nav-meme-of-the-day').click();

  await page.getByTestId('meme-card-comments-button').click({ timeout: 15000 });

  const commentoUnico = `Test commento:${Date.now().toString().slice(-6)}`;
  await page.getByTestId('comment-input-textarea').fill(commentoUnico);
  await page.getByTestId('comment-submit-button').click();

  await expect(page.getByText('Devi effettuare il login per poter commentare.')).toBeVisible({ timeout: 10000 });
});

test('Utente autenticato dovrebbe poter postare un commento con successo', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.getByTestId('nav-login').click();
  
  await expect(page).toHaveURL('/login', { timeout: 15000 });
  
  await page.getByTestId('login-username-input').fill('alessandro');
  await page.getByTestId('login-password-input').fill('Alessandro3');
  await page.getByTestId('login-submit-button').click();

  await page.getByTestId('nav-meme-of-the-day').click();

  await page.getByTestId('meme-card-comments-button').click({ timeout: 15000 });

  const commentoUnico = `Test commento:${Date.now().toString().slice(-6)}`;
  await page.getByTestId('comment-input-textarea').fill(commentoUnico);
  await page.getByTestId('comment-submit-button').click();

  await expect(page.getByText(commentoUnico)).toBeVisible({ timeout: 20000 });
});
