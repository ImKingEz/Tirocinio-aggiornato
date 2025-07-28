import { test, expect } from '@playwright/test';

test('Dovrebbe reindirizzare un utente non autenticato alla pagina di login se prova ad accedere alla sezione Carica Meme', async ({ page }) => {
  await page.goto('http://localhost:4200/');

  await page.getByTestId('nav-upload-meme').click();

  await expect(page).toHaveURL("/login", { timeout: 15000 });
});