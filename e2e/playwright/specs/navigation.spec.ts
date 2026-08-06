import { test, expect } from '../fixtures';

test.describe('navigation', () => {
  test('root and welcome show the welcome page and footer', async ({ page }) => {
    for (const path of ['/petclinic/', '/petclinic/welcome']) {
      await page.goto(path);
      await expect(page.locator('h1.title')).toHaveText('Welcome to Petclinic');
      await expect(page.locator('h2')).toHaveText('Welcome');
      await expect(page.locator('img[alt="Angular"]')).toBeVisible();
      await expect(page.locator('img[alt="Sponsored by Pivotal"]')).toBeVisible();
      await expect(page.locator('img[alt="pets logo"]')).toBeVisible();
    }
  });

  test('Home navigates to welcome', async ({ page }) => {
    await page.goto('/petclinic/owners');
    await page.getByText('Home', { exact: true }).click();
    await expect(page).toHaveURL(/\/petclinic\/welcome$/);
  });

  test('Owners Search navigates to owners', async ({ page }) => {
    await page.goto('/petclinic/welcome');
    await page.getByText('Owners', { exact: true }).click();
    await page.getByText('Search', { exact: true }).click();
    await expect(page).toHaveURL(/\/petclinic\/owners$/);
    await expect(page.locator('h2')).toHaveText('Owners');
  });

  test('Owners Add New navigates to owner form', async ({ page }) => {
    await page.goto('/petclinic/welcome');
    await page.getByText('Owners', { exact: true }).click();
    await page.getByRole('link', { name: 'Add New', exact: true }).first().click();
    await expect(page).toHaveURL(/\/petclinic\/owners\/add$/);
    await expect(page.locator('h2')).toHaveText('New Owner');
  });

  test('Veterinarians links navigate to list and add form', async ({ page }) => {
    await page.goto('/petclinic/welcome');
    await page.getByRole('button', { name: 'Veterinarians' }).click();
    await page.getByText('All', { exact: true }).click();
    await expect(page).toHaveURL(/\/petclinic\/vets$/);
    await page.getByRole('button', { name: 'Veterinarians' }).click();
    await page.getByRole('link', { name: 'Add New', exact: true }).last().click();
    await expect(page).toHaveURL(/\/petclinic\/vets\/add$/);
    await expect(page.locator('h2')).toHaveText('New Veterinarian');
  });

  test('Pet Types navigates to pet types', async ({ page }) => {
    await page.goto('/petclinic/welcome');
    await page.getByText('Pet Types', { exact: true }).click();
    await expect(page).toHaveURL(/\/petclinic\/pettypes$/);
    await expect(page.locator('h2')).toHaveText('Pet Types');
  });

  test('Specialties navigates to specialties', async ({ page }) => {
    await page.goto('/petclinic/welcome');
    await page.getByText('Specialties', { exact: true }).click();
    await expect(page).toHaveURL(/\/petclinic\/specialties$/);
    await expect(page.locator('h2')).toHaveText('Specialties');
  });

  test('unknown routes show the 404 page', async ({ page }) => {
    await page.goto('/petclinic/no-such-page');
    await expect(page.locator('h1')).toHaveText('Oops! Page not found !');
    await expect(page.locator('h2')).toHaveText('Not Found - 404 error');
  });
});
