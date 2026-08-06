import { test, expect } from '../fixtures';

test.describe('vets', () => {
  test('list renders vet names and specialties with controls', async ({ page }) => {
    await page.goto('/petclinic/vets');
    await expect(page.locator('#vets')).toContainText('James Carter');
    await expect(page.locator('#vets')).toContainText('radiology');
    await expect(page.locator('#vets')).toContainText('surgery');
    await expect(page.locator('#vets')).toContainText('Helen Leary');
    await expect(page.getByText('Add Vet', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Home', exact: true })).toBeVisible();
  });

  test('Add Vet opens the native form and valid submit posts selected specialty', async ({ page, api }) => {
    await page.goto('/petclinic/vets');
    await page.getByText('Add Vet', { exact: true }).click();
    await expect(page).toHaveURL(/\/petclinic\/vets\/add$/);
    await page.locator('#firstName').fill('Sarah');
    await page.locator('#lastName').fill('Jones');
    await page.locator('#specialties').selectOption({ label: 'dentistry' });
    const response = page.waitForResponse((item) => item.url().endsWith('/vets') && item.request().method() === 'POST');
    await page.getByText('Save Vet', { exact: true }).click();
    await response;
    const post = api.requests.find((request) => request.method === 'POST' && request.url.endsWith('/vets'));
    expect(post?.body).toMatchObject({ firstName: 'Sarah', lastName: 'Jones', specialties: [{ id: 3, name: 'dentistry' }] });
    await expect(page).toHaveURL(/\/petclinic\/vets$/);
    await expect(page.locator('#vets')).toContainText('Sarah Jones');
  });

  test('vet add validation shows required and pattern messages', async ({ page }) => {
    await page.goto('/petclinic/vets/add');
    await page.locator('#firstName').fill('x');
    await page.locator('#firstName').fill('');
    await page.locator('#firstName').press('Tab');
    await page.locator('#lastName').fill('x');
    await page.locator('#lastName').fill('');
    await page.locator('#lastName').press('Tab');
    await expect(page.getByText('First name is required', { exact: true })).toBeVisible();
    await expect(page.getByText('Last name is required', { exact: true })).toBeVisible();
    await expect(page.getByText('Save Vet', { exact: true })).toBeDisabled();
    await page.locator('#firstName').fill('123');
    await page.locator('#firstName').press('Tab');
    await expect(page.getByText('First Name may only consist of letters', { exact: true })).toBeVisible();
  });

  test('vet edit loads names and Save Vet preserves existing specialties', async ({ page, api }) => {
    await page.goto('/petclinic/vets/1/edit');
    await expect(page.locator('#firstName')).toHaveValue('James');
    await expect(page.locator('#lastName')).toHaveValue('Carter');
    await page.locator('#firstName').fill('Jamie');
    const response = page.waitForResponse((item) => item.url().endsWith('/vets/1') && item.request().method() === 'PUT');
    await page.getByText('Save Vet', { exact: true }).click();
    await response;
    const put = api.requests.find((request) => request.method === 'PUT' && request.url.endsWith('/vets/1'));
    expect(put?.body).toMatchObject({ id: 1, firstName: 'Jamie', lastName: 'Carter', specialties: [{ id: 1, name: 'radiology' }, { id: 2, name: 'surgery' }] });
    await expect(page).toHaveURL(/\/petclinic\/vets$/);
    await expect(page.locator('#vets')).toContainText('Jamie Carter');
  });

  test('vet edit Back returns to the list without opening the specialty overlay', async ({ page }) => {
    await page.goto('/petclinic/vets/1/edit');
    await expect(page.locator('#firstName')).toHaveValue('James');
    await page.getByText('< Back', { exact: true }).click();
    await expect(page).toHaveURL(/\/petclinic\/vets$/);
  });

  test('Home from vets navigates to welcome', async ({ page }) => {
    await page.goto('/petclinic/vets');
    await page.getByRole('button', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL(/\/petclinic\/welcome$/);
  });
});
