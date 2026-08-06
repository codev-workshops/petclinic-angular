import { test, expect } from '../fixtures';

test.describe('pet types', () => {
  test('list renders seeded rows and Add toggles inline form', async ({ page }) => {
    await page.goto('/petclinic/pettypes');
    for (const [index, value] of ['cat', 'dog', 'lizard'].entries()) {
      await expect(page.locator('#pettypes .form-control').nth(index)).toHaveValue(value);
    }
    await page.getByText('Add', { exact: true }).click();
    await expect(page.locator('h2')).toHaveText(['Pet Types', 'New Pet Type']);
  });

  test('inline add posts, appends a row, and closes the form', async ({ page, api }) => {
    await page.goto('/petclinic/pettypes');
    await page.getByText('Add', { exact: true }).click();
    await page.locator('input#name').last().fill('hamster');
    const response = page.waitForResponse((item) => item.url().endsWith('/pettypes') && item.request().method() === 'POST');
    await page.getByText('Save', { exact: true }).click();
    await response;
    const post = api.requests.find((request) => request.method === 'POST' && request.url.endsWith('/pettypes'));
    expect(post?.body).toMatchObject({ name: 'hamster' });
    for (const [index, value] of ['cat', 'dog', 'lizard', 'hamster'].entries()) {
      await expect(page.locator('#pettypes .form-control').nth(index)).toHaveValue(value);
    }
    await expect(page.getByText('New Pet Type', { exact: true })).toHaveCount(0);
  });

  test('standalone add route renders and validates', async ({ page }) => {
    await page.goto('/petclinic/pettypes/add');
    await expect(page.locator('h2')).toHaveText('New Pet Type');
    await page.locator('#name').fill('!');
    await page.locator('#name').press('Tab');
    await expect(page.locator('.help-block')).toContainText('Name must begin with a letter or digit');
    await expect(page.getByText('Save', { exact: true })).toBeDisabled();
  });

  test('edit loads, updates, and Cancel returns to the list', async ({ page, api }) => {
    await page.goto('/petclinic/pettypes');
    await page.locator('#pettypes tr').nth(1).getByText('Edit', { exact: true }).click();
    await expect(page).toHaveURL(/\/petclinic\/pettypes\/1\/edit$/);
    await expect(page.locator('#name')).toHaveValue('cat');
    await page.locator('#name').fill('feline');
    const response = page.waitForResponse((item) => item.url().endsWith('/pettypes/1') && item.request().method() === 'PUT');
    await page.getByText('Update', { exact: true }).click();
    await response;
    const put = api.requests.find((request) => request.method === 'PUT' && request.url.endsWith('/pettypes/1'));
    expect(put?.body).toMatchObject({ id: 1, name: 'feline' });
    await expect(page).toHaveURL(/\/petclinic\/pettypes$/);
    await expect(page.locator('#pettypes .form-control').first()).toHaveValue('feline');
    await expect(page.locator('#pettypes .form-control').first()).toHaveValue('feline');
    await page.locator('#pettypes tr').nth(1).getByText('Edit', { exact: true }).click();
    await page.getByText('Cancel', { exact: true }).click();
    await expect(page).toHaveURL(/\/petclinic\/pettypes$/);
  });

  test('delete removes a pet type and Home navigates welcome', async ({ page, api }) => {
    await page.goto('/petclinic/pettypes');
    await page.locator('#pettypes tr').nth(1).getByText('Delete', { exact: true }).click();
    await expect.poll(() => api.requests.some((request) => request.method === 'DELETE' && request.url.endsWith('/pettypes/1'))).toBeTruthy();
    await expect(page.locator('#pettypes')).not.toContainText('cat');
    await page.getByRole('button', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL(/\/petclinic\/welcome$/);
  });

  test('name required and maxlength validation is exposed', async ({ page }) => {
    await page.goto('/petclinic/pettypes/add');
    await page.locator('#name').fill('x');
    await page.locator('#name').fill('');
    await page.locator('#name').press('Tab');
    await expect(page.locator('.help-block')).toContainText('Name is required');
    await page.locator('#name').fill('a'.repeat(81));
    await page.locator('#name').press('Tab');
    await expect(page.locator('#name')).toHaveAttribute('maxlength', '80');
  });

  test('pet types list remains rendered when GET pettypes fails', async ({ page, api }) => {
    api.override('GET', '/pettypes', { status: 500, body: 'Pet types unavailable' });
    await page.goto('/petclinic/pettypes');
    await expect(page.locator('h2')).toHaveText('Pet Types');
    await expect(page.getByText('Add', { exact: true })).toBeVisible();
    await expect(page.locator('#pettypes')).toBeVisible();
  });
});
