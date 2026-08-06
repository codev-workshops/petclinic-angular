import { test, expect } from '../fixtures';

test.describe('visits', () => {
  test('owner detail add visit opens pet summary and previous visits', async ({ page }) => {
    await page.goto('/petclinic/owners/1');
    await page.getByText('Add Visit', { exact: true }).first().click();
    await expect(page).toHaveURL(/\/petclinic\/pets\/1\/visits\/add$/);
    await expect(page.locator('h2')).toHaveText('New Visit');
    await expect(page.locator('.table').first()).toContainText('Leo');
    await expect(page.locator('.table').first()).toContainText('2020-01-15');
    await expect(page.locator('.table').first()).toContainText('cat');
    await expect(page.locator('.table').first()).toContainText('John Doe');
    await expect(page.locator('.xd-container')).toContainText('Annual checkup');
  });

  test('valid visit submit posts ISO date and navigates to owner detail', async ({ page, api }) => {
    await page.goto('/petclinic/pets/1/visits/add');
    await page.locator('input[name="date"]').fill('2024-02-10');
    await page.locator('#description').fill('Dental review');
    const response = page.waitForResponse((item) => item.url().endsWith('/owners/1/pets/1/visits') && item.request().method() === 'POST');
    await page.getByText('Add Visit', { exact: true }).click();
    await response;
    const post = api.requests.find((request) => request.method === 'POST' && request.url.endsWith('/owners/1/pets/1/visits'));
    expect(post?.body).toMatchObject({ date: '2024-02-10', description: 'Dental review' });
    await expect(page).toHaveURL(/\/petclinic\/owners\/1$/);
    await expect(page.locator('.xd-container')).toContainText('Dental review');
  });

  test('visit description validation disables submit', async ({ page }) => {
    await page.goto('/petclinic/pets/1/visits/add');
    await page.locator('#description').fill('x');
    await page.locator('#description').fill('');
    await page.locator('#description').press('Tab');
    await expect(page.locator('.help-block')).toContainText('Description is required');
    await expect(page.getByText('Add Visit', { exact: true })).toBeDisabled();
  });

  test('edit visit updates the visit and returns to owner detail', async ({ page, api }) => {
    await page.goto('/petclinic/owners/1');
    await page.getByText('Edit Visit', { exact: true }).first().click();
    await expect(page).toHaveURL(/\/petclinic\/visits\/1\/edit$/);
    await expect(page.locator('#description')).toHaveValue('Annual checkup');
    await page.locator('#description').fill('Updated checkup');
    const response = page.waitForResponse((item) => item.url().endsWith('/visits/1') && item.request().method() === 'PUT');
    await page.getByText('Update Visit', { exact: true }).click();
    await response;
    const put = api.requests.find((request) => request.method === 'PUT' && request.url.endsWith('/visits/1'));
    expect(put?.body).toMatchObject({ id: 1, description: 'Updated checkup', date: '2023-04-15' });
    await expect(page).toHaveURL(/\/petclinic\/owners\/1$/);
    await expect(page.locator('.xd-container')).toContainText('Updated checkup');
  });

  test('delete visit removes its row', async ({ page }) => {
    await page.goto('/petclinic/owners/1');
    await expect(page.locator('.xd-container')).toContainText('Annual checkup');
    await page.getByText('Delete Visit', { exact: true }).first().click();
    await expect(page.locator('.xd-container')).not.toContainText('Annual checkup');
  });

  test('visits list route renders', async ({ page }) => {
    await page.goto('/petclinic/visits');
    await expect(page.locator('.table')).toContainText('Visit Date');
    await expect(page.locator('.table')).toContainText('Description');
    await expect(page.locator('.table')).toContainText('Actions');
  });

  test('visits add route renders', async ({ page }) => {
    await page.goto('/petclinic/visits/add');
    await expect(page.locator('h2')).toHaveText('New Visit');
  });
});
