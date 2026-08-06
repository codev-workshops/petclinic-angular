import { test, expect } from '../fixtures';

test.describe('pets', () => {
  test('owner detail links to add pet and preloads owner and types', async ({ page }) => {
    await page.goto('/petclinic/owners/1');
    await page.getByText('Add New Pet', { exact: true }).click();
    await expect(page).toHaveURL(/\/petclinic\/owners\/1\/pets\/add$/);
    await expect(page.locator('h2')).toHaveText('Add Pet');
    await expect(page.locator('#owner_name')).toHaveValue('John Doe');
    await expect(page.locator('#type option')).toHaveText(['cat', 'dog', 'lizard']);
  });

  test('valid pet submit posts selected type and ISO birth date', async ({ page, api }) => {
    await page.goto('/petclinic/owners/1/pets/add');
    await page.locator('#name').fill('Birdie');
    await page.locator('input[name="birthDate"]').fill('2024-01-20');
    await page.locator('#type').selectOption({ label: 'dog' });
    const response = page.waitForResponse((item) => item.url().endsWith('/owners/1/pets') && item.request().method() === 'POST');
    await page.getByText('Save Pet', { exact: true }).click();
    await response;
    const post = api.requests.find((request) => request.method === 'POST' && request.url.endsWith('/owners/1/pets'));
    expect(post?.body).toMatchObject({ name: 'Birdie', birthDate: '2024-01-20', type: { id: 2, name: 'dog' } });
    await expect(page).toHaveURL(/\/petclinic\/owners\/1$/);
    await expect(page.locator('.xd-container')).toContainText('Birdie');
  });

  test('pet validation shows name and birth date errors', async ({ page }) => {
    await page.goto('/petclinic/owners/1/pets/add');
    await page.locator('#name').fill('');
    await page.locator('#name').press('Tab');
    await page.locator('input[name="birthDate"]').fill('');
    await page.locator('input[name="birthDate"]').press('Tab');
    await page.locator('#name').fill('x');
    await page.locator('#name').fill('');
    await page.locator('input[name="birthDate"]').fill('2024-01-20');
    await page.locator('input[name="birthDate"]').fill('');
    await expect(page.locator('.help-block')).toContainText(['Name is required', 'BirthDate is required']);
    await expect(page.getByText('Save Pet', { exact: true })).toBeDisabled();
    await page.locator('#name').fill('!');
    await page.locator('#name').press('Tab');
    await expect(page.getByText('Name must begin with a letter', { exact: true })).toBeVisible();
  });

  test('pet edit loads values and changing type puts the selected object', async ({ page, api }) => {
    await page.goto('/petclinic/pets/1/edit');
    await expect(page.locator('#name')).toHaveValue('Leo');
    await expect(page.locator('#type1')).toHaveValue('cat');
    await page.locator('#name').fill('Leo Updated');
    await page.locator('select[name="pettype"]').selectOption({ label: 'dog' });
    const response = page.waitForResponse((item) => item.url().endsWith('/pets/1') && item.request().method() === 'PUT');
    await page.getByText('Update Pet', { exact: true }).click();
    await response;
    const put = api.requests.find((request) => request.method === 'PUT' && request.url.endsWith('/pets/1'));
    expect(put?.body).toMatchObject({ id: 1, name: 'Leo Updated', type: { id: 2, name: 'dog' }, birthDate: '2020-01-15' });
    await expect(page).toHaveURL(/\/petclinic\/owners\/1$/);
    await expect(page.locator('.xd-container')).toContainText('Leo Updated');
  });

  test('pet delete hides the pet from owner detail', async ({ page }) => {
    await page.goto('/petclinic/owners/1');
    await expect(page.locator('.xd-container')).toContainText('Rex');
    await page.getByText('Delete Pet', { exact: true }).nth(1).click();
    await expect(page.locator('.xd-container')).not.toContainText('Rex');
  });

  test('pets list route renders', async ({ page }) => {
    await page.goto('/petclinic/pets');
    await expect(page.locator('dl.dl-horizontal')).toContainText('Name');
    await expect(page.locator('dl.dl-horizontal')).toContainText('Birth Date');
    await expect(page.locator('dl.dl-horizontal')).toContainText('Type');
    await expect(page.getByRole('button', { name: 'Edit Pet', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete Pet', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Visit', exact: true })).toBeVisible();
  });

  test('pets add route renders', async ({ page }) => {
    await page.goto('/petclinic/pets/add');
    await expect(page.locator('h2')).toHaveText('Add Pet');
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('input[name="birthDate"]')).toBeVisible();
  });
});
