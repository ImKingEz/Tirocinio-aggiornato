import { test, expect } from '@playwright/test';

test('Dovrebbe resettare i filtri di visualizzazione dopo aver cliccato il tasto resetta filtri', async ({ page }) => {
 await page.goto('http://localhost:4200/');
  const sortBySelect = page.getByTestId('filter-sort-by');
  const sortOrderSelect = page.getByTestId('filter-sort-order');
  const limitSelect = page.getByTestId('filter-limit');
  const resetButton = page.getByTestId('filters-reset-button');
 
  await expect(sortBySelect).toHaveValue('');
  await expect(sortOrderSelect).toHaveValue('');
  await expect(limitSelect).toHaveValue('');
 
  await sortBySelect.selectOption({ label: 'upvotes' });
  await sortOrderSelect.selectOption({ label: 'decrescente' });
  await limitSelect.selectOption({ value: '3' });
 
  await expect(sortBySelect).toHaveValue('upvotes', { timeout: 15000 });
  await expect(sortOrderSelect).toHaveValue('desc', { timeout: 15000 });
  await expect(limitSelect).toHaveValue('3', { timeout: 15000 });
 
  await resetButton.click();
 
  await expect(sortBySelect).toHaveValue('', { timeout: 15000 });
  await expect(sortOrderSelect).toHaveValue('', { timeout: 15000 });
  await expect(limitSelect).toHaveValue('', { timeout: 15000 });
});