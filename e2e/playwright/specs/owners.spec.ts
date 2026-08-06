import { test, expect } from '../fixtures';

test.describe('owners', () => {
  test('renders seeded owners and pet columns', async ({ page }) => {
    await page.goto('/petclinic/owners');
    const table = page.locator('#ownersTable');
    await expect(table).toContainText('John Doe');
    await expect(table).toContainText('1 Main Street');
    await expect(table).toContainText('Springfield');
    await expect(table).toContainText('1234567890');
    await expect(table).toContainText('Leo');
    await expect(table).toContainText('Jane Smith');
    await expect(page.getByText('Add Owner', { exact: true })).toBeVisible();
  });

  test('clicking an owner name opens owner detail', async ({ page }) => {
    await page.goto('/petclinic/owners');
    await page.getByRole('link', { name: 'John Doe' }).click();
    await expect(page).toHaveURL(/\/petclinic\/owners\/1$/);
    await expect(page.locator('h2').first()).toHaveText('Owner Information');
    await expect(page.locator('h2').nth(1)).toHaveText('Pets and Visits');
    await expect(page.locator('.xd-container')).toContainText('John Doe');
    await expect(page.locator('.xd-container')).toContainText('Leo');
    await expect(page.locator('.xd-container')).toContainText('Annual checkup');
  });

  test('search filters, empty restores, and no-match renders the message', async ({ page, api }) => {
    await page.goto('/petclinic/owners');
    const input = page.locator('#search-owner-form #lastName');
    api.requests.length = 0;
    await input.fill('Smi');
    const searched = page.waitForResponse((response) => response.url().endsWith('/owners?lastName=Smi'));
    await page.getByText('Find Owner', { exact: true }).click();
    await searched;
    expect(api.requests.some((request) => request.method === 'GET' && request.url.endsWith('/owners?lastName=Smi'))).toBeTruthy();
    await expect(page.locator('#ownersTable')).toContainText('Jane Smith');
    await expect(page.locator('#ownersTable')).not.toContainText('John Doe');
    await input.fill('');
    const restored = page.waitForResponse((response) => response.url().endsWith('/owners'));
    await page.getByText('Find Owner', { exact: true }).click();
    await restored;
    expect(api.requests.some((request) => request.method === 'GET' && request.url.endsWith('/owners'))).toBeTruthy();
    await expect(page.locator('#ownersTable')).toContainText('John Doe');
    await input.fill('Nobody');
    const noMatch = page.waitForResponse((response) => response.url().endsWith('/owners?lastName=Nobody'));
    await page.getByText('Find Owner', { exact: true }).click();
    await noMatch;
    await expect(page.locator('#ownersTable')).toHaveCount(0);
    await expect(page.locator('.xd-container')).toContainText('No owners with LastName starting with "Nobody"');
  });

  test('Add Owner button navigates to the add form', async ({ page }) => {
    await page.goto('/petclinic/owners');
    await page.getByText('Add Owner', { exact: true }).click();
    await expect(page).toHaveURL(/\/petclinic\/owners\/add$/);
  });

  test('owner detail Back navigates to owners', async ({ page }) => {
    await page.goto('/petclinic/owners/1');
    await page.getByText('Back', { exact: true }).click();
    await expect(page).toHaveURL(/\/petclinic\/owners$/);
  });

  test('owner search requests use exact query strings', async ({ page, api }) => {
    await page.goto('/petclinic/owners');
    api.requests.length = 0;
    const input = page.locator('#search-owner-form #lastName');
    const searched = page.waitForResponse((response) => response.url().endsWith('/owners?lastName=Smi'));
    await input.fill('Smi');
    await page.getByText('Find Owner', { exact: true }).click();
    await searched;
    expect(api.requests.some((request) => request.method === 'GET' && request.url.endsWith('/owners?lastName=Smi'))).toBeTruthy();
    const restored = page.waitForResponse((response) => response.url().endsWith('/owners'));
    await input.fill('');
    await page.getByText('Find Owner', { exact: true }).click();
    await restored;
    expect(api.requests.some((request) => request.method === 'GET' && request.url === 'http://localhost:9966/petclinic/api/owners')).toBeTruthy();
  });

  test('owners list remains in its empty state when GET owners fails', async ({ page, api }) => {
    api.override('GET', '/owners', { status: 500, body: 'Owners unavailable' });
    await page.goto('/petclinic/owners');
    await expect(page.locator('h2')).toHaveText('Owners');
    await expect(page.locator('#search-owner-form')).toBeVisible();
    await expect(page.locator('.xd-container')).toContainText('No owners with LastName starting with ""');
  });

  test('valid owner submit posts the form and returns to the owners list', async ({ page, api }) => {
    await page.goto('/petclinic/owners/add');
    await page.locator('#firstName').fill('Alice');
    await page.locator('#lastName').fill('Jones');
    await page.locator('#address').fill('3 Pine Road');
    await page.locator('#city').fill('Capital City');
    await page.locator('#telephone').fill('9876543210');
    const response = page.waitForResponse((item) => item.url().endsWith('/owners') && item.request().method() === 'POST');
    await page.getByText('Add Owner', { exact: true }).click();
    await response;
    const post = api.requests.find((request) => request.method === 'POST' && request.url.endsWith('/owners'));
    expect(post?.body).toMatchObject({ firstName: 'Alice', lastName: 'Jones', address: '3 Pine Road', city: 'Capital City', telephone: '9876543210' });
    await expect(page).toHaveURL(/\/petclinic\/owners$/);
    await expect(page.locator('#ownersTable')).toContainText('Alice Jones');
  });

  test('owner validation messages appear and submit is disabled', async ({ page }) => {
    await page.goto('/petclinic/owners/add');
    for (const id of ['firstName', 'lastName', 'address', 'city', 'telephone']) {
      await page.locator(`#${id}`).fill('x');
      await page.locator(`#${id}`).fill('');
      await page.locator(`#${id}`).press('Tab');
    }
    await expect(page.locator('.help-block')).toContainText(['First name is required', 'Last name is required', 'Address is required', 'City is required', 'Phone number is required']);
    await expect(page.getByText('Add Owner', { exact: true })).toBeDisabled();
    await page.locator('#firstName').fill('123');
    await page.locator('#firstName').press('Tab');
    await expect(page.getByText('First name must consist of letters only', { exact: true })).toBeVisible();
    await page.locator('#telephone').fill('abc');
    await page.locator('#telephone').press('Tab');
    await expect(page.getByText('Phone number only accept digits', { exact: true })).toBeVisible();
  });

  test('owner edit loads values and puts updates back to detail', async ({ page, api }) => {
    await page.goto('/petclinic/owners/1/edit');
    await expect(page.locator('#firstName')).toHaveValue('John');
    await expect(page.locator('#lastName')).toHaveValue('Doe');
    await page.locator('#firstName').fill('Johnny');
    const response = page.waitForResponse((item) => item.url().endsWith('/owners/1') && item.request().method() === 'PUT');
    await page.getByText('Update Owner', { exact: true }).click();
    await response;
    const put = api.requests.find((request) => request.method === 'PUT' && request.url.endsWith('/owners/1'));
    expect(put?.body).toMatchObject({ id: 1, firstName: 'Johnny', lastName: 'Doe', address: '1 Main Street', city: 'Springfield', telephone: '1234567890' });
    await expect(page).toHaveURL(/\/petclinic\/owners\/1$/);
    await expect(page.locator('.xd-container')).toContainText('Johnny Doe');
    await expect(page.locator('.xd-container')).toContainText('Johnny Doe');
  });

  test('owner edit displays the server errors header message', async ({ page, api }) => {
    api.override('PUT', '/owners/1', {
      status: 400,
      headers: { 'content-type': 'application/json', 'access-control-expose-headers': 'errors', errors: JSON.stringify([{ errorMessage: 'Owner update failed' }]) },
      body: '{}',
    });
    await page.goto('/petclinic/owners/1/edit');
    await page.locator('#firstName').fill('Johnny');
    await page.getByText('Update Owner', { exact: true }).click();
    await expect(page.locator('div.alert.alert-danger')).toHaveText('Owner update failed');
  });

  test('owner form has required and pattern classes after invalid input', async ({ page }) => {
    await page.goto('/petclinic/owners/add');
    await page.locator('#firstName').fill('123');
    await page.locator('#firstName').press('Tab');
    const group = page.locator('div.form-group').filter({ has: page.locator('#firstName') });
    await expect(group).toHaveClass(/has-error/);
    await page.locator('#firstName').fill('Alice');
    await expect(group).toHaveClass(/has-success/);
  });

  test('owner detail edit and back controls preserve routes', async ({ page }) => {
    await page.goto('/petclinic/owners/1');
    await page.getByText('Edit Owner', { exact: true }).click();
    await expect(page).toHaveURL(/\/petclinic\/owners\/1\/edit$/);
    await page.getByText('Back', { exact: true }).click();
    await expect(page).toHaveURL(/\/petclinic\/owners\/1$/);
  });
});
