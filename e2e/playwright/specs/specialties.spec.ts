import { test, expect } from '../fixtures';

test.describe('specialties', () => {
  test('list renders rows and Add toggles inline form', async ({ page }) => {
    await page.goto('/petclinic/specialties');
    for (const [index, value] of ['radiology', 'surgery', 'dentistry'].entries()) {
      await expect(page.locator('#specialties .form-control').nth(index)).toHaveValue(value);
    }
    await page.getByText('Add', { exact: true }).click();
    await expect(page.locator('h2')).toHaveText(['Specialties', 'New Specialty']);
  });

  test('inline add posts, appends a specialty, and closes the form', async ({ page, api }) => {
    await page.goto('/petclinic/specialties');
    await page.getByText('Add', { exact: true }).click();
    await page.locator('input#name').last().fill('oncology');
    const response = page.waitForResponse((item) => item.url().endsWith('/specialties') && item.request().method() === 'POST');
    await page.getByText('Save', { exact: true }).click();
    await response;
    const post = api.requests.find((request) => request.method === 'POST' && request.url.endsWith('/specialties'));
    expect(post?.body).toMatchObject({ name: 'oncology' });
    for (const [index, value] of ['radiology', 'surgery', 'dentistry', 'oncology'].entries()) {
      await expect(page.locator('#specialties .form-control').nth(index)).toHaveValue(value);
    }
    await expect(page.getByText('New Specialty', { exact: true })).toHaveCount(0);
  });

  test('edit loads, updates, and Cancel returns to list', async ({ page, api }) => {
    await page.goto('/petclinic/specialties');
    await page.locator('#specialties tr').nth(1).getByText('Edit', { exact: true }).click();
    await expect(page).toHaveURL(/\/petclinic\/specialties\/1\/edit$/);
    await expect(page.locator('#name')).toHaveValue('radiology');
    await page.locator('#name').fill('imaging');
    const response = page.waitForResponse((item) => item.url().endsWith('/specialties/1') && item.request().method() === 'PUT');
    await page.getByText('Update', { exact: true }).click();
    await response;
    const put = api.requests.find((request) => request.method === 'PUT' && request.url.endsWith('/specialties/1'));
    expect(put?.body).toMatchObject({ id: 1, name: 'imaging' });
    await expect(page).toHaveURL(/\/petclinic\/specialties$/);
    await expect(page.locator('#specialties .form-control').first()).toHaveValue('imaging');
    await expect(page.locator('#specialties .form-control').first()).toHaveValue('imaging');
    await page.locator('#specialties tr').nth(1).getByText('Edit', { exact: true }).click();
    await page.getByText('Cancel', { exact: true }).click();
    await expect(page).toHaveURL(/\/petclinic\/specialties$/);
  });

  test('delete removes the row', async ({ page, api }) => {
    await page.goto('/petclinic/specialties');
    await page.locator('#specialties tr').nth(1).getByText('Delete', { exact: true }).click();
    await expect.poll(() => api.requests.some((request) => request.method === 'DELETE' && request.url.endsWith('/specialties/1'))).toBeTruthy();
    await expect(page.locator('#specialties input').first()).not.toHaveValue('radiology');
  });

  test('validation messages appear', async ({ page }) => {
    await page.goto('/petclinic/specialties');
    await page.getByText('Add', { exact: true }).click();
    await page.locator('input#name').last().fill('x');
    await page.locator('input#name').last().fill('');
    await page.locator('input#name').last().press('Tab');
    await expect(page.locator('.help-block')).toContainText('Name is required');
    await page.locator('input#name').last().fill('!');
    await page.locator('input#name').last().press('Tab');
    await expect(page.locator('.help-block')).toContainText('Name must begin with a letter or digit');
  });

  test('Home navigates to welcome', async ({ page }) => {
    await page.goto('/petclinic/specialties');
    await page.getByRole('button', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL(/\/petclinic\/welcome$/);
  });
});
