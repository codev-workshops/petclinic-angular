import { expect, test, uniq } from '../fixtures';

test.describe('owners', () => {
  test('J01 owner search -> detail -> add pet -> add visit chain', async ({ ui, api, cleanup, page }) => {
    const owner = await api.createOwner();
    cleanup(() => api.removeOwner(owner.id!));
    const petName = uniq('Rex');
    const visitText = uniq('Checkup');

    await ui.goto('/owners');
    await expect(ui.heading('Owners')).toBeVisible();
    await page.locator('input#lastName').fill(owner.lastName);
    await ui.button('Find Owner').click();
    await page.getByRole('link', { name: `${owner.firstName} ${owner.lastName}` }).click();
    await ui.expectAppPath(`/owners/${owner.id}`);
    await expect(ui.heading('Owner Information')).toBeVisible();
    await expect(page.locator('.ownerFullName')).toHaveText(`${owner.firstName} ${owner.lastName}`);

    await ui.button('Add New Pet').click();
    await ui.expectAppPath(`/owners/${owner.id}/pets/add`);
    await expect(page.locator('input#owner_name')).toHaveValue(`${owner.firstName} ${owner.lastName}`);
    await page.locator('input#name').fill(petName);
    await ui.fillDate('birthDate', '2021-03-09');
    await page.locator('select#type').selectOption({ label: 'dog' });
    await ui.button('Save Pet').click();
    await ui.expectAppPath(`/owners/${owner.id}`);

    const petRow = page.locator('dl.dl-horizontal', { hasText: petName });
    await expect(petRow).toBeVisible();
    await expect(petRow).toContainText('2021-03-09');
    await expect(petRow).toContainText('dog');

    await petRow.getByRole('button', { name: 'Add Visit' }).click();
    await ui.expectAppPath(/^\/pets\/\d+\/visits\/add$/);
    await expect(ui.heading('New Visit')).toBeVisible();
    await expect(page.locator('table').first()).toContainText(petName);
    await ui.fillDate('date', '2024-06-15');
    await page.locator('input#description').fill(visitText);
    await ui.button('Add Visit').click();
    await ui.expectAppPath(`/owners/${owner.id}`);
    const visitRow = page.locator('table.table-condensed tr', { hasText: visitText });
    await expect(visitRow).toContainText('2024-06-15');

    const stored = await api.getOwner(owner.id!);
    const storedPet = stored.pets?.find((pet) => pet.name === petName);
    expect(storedPet?.birthDate).toBe('2021-03-09');
    expect(storedPet?.visits?.[0]?.date).toBe('2024-06-15');
    await ui.snapshot('J01-owner-chain');
  });

  test('J02 owner add', async ({ ui, api, cleanup, page, target }) => {
    const firstName = uniq('Add');
    const lastName = uniq('Owner');

    await ui.goto('/owners/add');
    await expect(ui.heading('New Owner')).toBeVisible();
    await expect(ui.button('Add Owner')).toBeDisabled();
    await page.locator('input#firstName').fill(firstName);
    await page.locator('input#lastName').fill(lastName);
    await page.locator('input#address').fill('12 Parity Road');
    await page.locator('input#city').fill('Springfield');
    await page.locator('input#telephone').fill('5551234567');
    await expect(ui.button('Add Owner')).toBeEnabled();
    await ui.button('Add Owner').click();

    // Known deviation: Angular returns to the list, React (AGENTS.md) opens the created owner.
    if (target === 'angular') {
      await ui.expectAppPath('/owners');
    } else {
      await ui.expectAppPath(/^\/owners\/\d+$/);
      await expect(page.locator('.ownerFullName')).toHaveText(`${firstName} ${lastName}`);
    }

    await ui.goto('/owners');
    await page.locator('input#lastName').fill(lastName);
    await ui.button('Find Owner').click();
    const row = page.locator('tr', { hasText: `${firstName} ${lastName}` });
    await expect(row).toContainText('12 Parity Road');
    await expect(row).toContainText('Springfield');
    await expect(row).toContainText('5551234567');
    const href = await row.getByRole('link').getAttribute('href');
    const id = Number(href?.match(/owners\/(\d+)/)?.[1]);
    cleanup(() => api.removeOwner(id));
    await ui.snapshot('J02-owner-add');
  });

  test('J03 owner edit', async ({ ui, api, cleanup, page }) => {
    const owner = await api.createOwner();
    cleanup(() => api.removeOwner(owner.id!));
    const newCity = uniq('City');

    await ui.goto(`/owners/${owner.id}/edit`);
    await expect(ui.heading('Edit Owner')).toBeVisible();
    await expect(page.locator('input#firstName')).toHaveValue(owner.firstName);
    await expect(page.locator('input#lastName')).toHaveValue(owner.lastName);
    await expect(page.locator('input#telephone')).toHaveValue(owner.telephone);
    await page.locator('input#city').fill(newCity);
    await ui.button('Update Owner').click();
    await ui.expectAppPath(`/owners/${owner.id}`);
    await expect(page.locator('table').first()).toContainText(newCity);
    expect((await api.getOwner(owner.id!)).city).toBe(newCity);
    await ui.snapshot('J03-owner-edit');
  });

  test('J04 owner search by last name, including not found', async ({ ui, api, cleanup, page }) => {
    const owner = await api.createOwner();
    cleanup(() => api.removeOwner(owner.id!));

    await ui.goto('/owners');
    await expect(page.locator('#ownersTable tbody tr').first()).toBeVisible();
    const totalRows = await page.locator('#ownersTable tbody tr').count();
    expect(totalRows).toBeGreaterThan(1);

    await page.locator('input#lastName').fill(owner.lastName);
    await ui.button('Find Owner').click();
    await expect(page.locator('#ownersTable tbody tr')).toHaveCount(1);
    await expect(page.locator('#ownersTable')).toContainText(`${owner.firstName} ${owner.lastName}`);

    const missing = uniq('Nobody');
    await page.locator('input#lastName').fill(missing);
    await ui.button('Find Owner').click();
    await expect(page.getByText(`No owners with LastName starting with "${missing}"`)).toBeVisible();
    await expect(page.locator('#ownersTable')).toHaveCount(0);
    await ui.snapshot('J04-owner-search-not-found');

    await page.locator('input#lastName').fill('');
    await ui.button('Find Owner').click();
    await expect(page.locator('#ownersTable tbody tr')).toHaveCount(totalRows);
  });
});
