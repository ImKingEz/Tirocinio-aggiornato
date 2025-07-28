import { test, expect } from '@playwright/test';
import path from 'path';

test('Un utente autenticato carica un nuovo meme con successo', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.getByTestId('nav-login').click();
  
  await expect(page).toHaveURL('/login', { timeout: 15000 });
  
  await page.getByTestId('login-username-input').fill('alessandro');
  await page.getByTestId('login-password-input').fill('Alessandro3');
  await page.getByTestId('login-submit-button').click();
  
  await page.getByTestId('nav-upload-meme').click();

  const filePath = path.join(__dirname, '..', 'image-test', 'test-image.jpg');
  await page.getByTestId('upload-file-input').setInputFiles(filePath);
  await page.getByTestId('upload-tags-input').fill('test,bello');
  await page.getByTestId('upload-submit-button').click();
    
  await expect(page.getByText('Meme caricato con successo!')).toBeVisible({ timeout: 15000 }); // Upload può essere lento
});

test('Un utente autenticato inserisce un immagine con proporzioni errate e riceve l\'errore', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.getByTestId('nav-login').click();
  
  await expect(page).toHaveURL('/login', { timeout: 15000 });
  
  await page.getByTestId('login-username-input').fill('alessandro');
  await page.getByTestId('login-password-input').fill('Alessandro3');
  await page.getByTestId('login-submit-button').click();

  await page.getByTestId('nav-upload-meme').click();

  const filePath = path.join(__dirname, '..', 'image-test', 'fail-test-image.png');
  await page.getByTestId('upload-file-input').setInputFiles(filePath);

  await page.getByTestId('upload-tags-input').fill('test,bello');
  
  await expect(page.getByText("Formato dell'immagine inserita non valido, scegli un'altra immagine.")).toBeVisible({ timeout: 5000 });
  await expect(page.getByTestId('upload-submit-button')).toBeDisabled();
});

test("Un utente autenticato inserisce piu' di 3 tag e riceve l'errore", async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.getByTestId('nav-login').click();
  
  await expect(page).toHaveURL('/login', { timeout: 15000 });
  
  await page.getByTestId('login-username-input').fill('alessandro');
  await page.getByTestId('login-password-input').fill('Alessandro3');
  await page.getByTestId('login-submit-button').click();

  await page.getByTestId('nav-upload-meme').click();

  const filePath = path.join(__dirname, '..', 'image-test', 'test-image.jpg');
  await page.getByTestId('upload-file-input').setInputFiles(filePath);
  await page.getByTestId('upload-tags-input').fill('test,bello,divertimento,passione');
  
  await expect(page.getByText('Puoi inserire al massimo 3 tag.')).toBeVisible();
  await expect(page.getByTestId('upload-submit-button')).toBeDisabled();
});