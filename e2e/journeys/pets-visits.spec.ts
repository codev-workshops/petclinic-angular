import { expect, test, uniq } from '../fixtures';

test.describe('pets and visits', () => {
  test('J05 pet edit round-trips birthDate as local YYYY-MM-DD', async ({ ui, api, cleanup, page }) => {
    const owner = await api.createOwner();
    cleanup(() => api.removeOwner(owner.id!));
    const pet = await api.createPet(owner.id!, { birthDate: '2018-12-31' });
    const newName = uniq('Fido');

    await ui.goto(`/pets/${pet.id}/edit`);
    await expect(ui.heading('Pet')).toBeVisible();
    await expect(page.locator('input#owner_name')).toHaveValue(`${owner.firstName} ${owner.lastName}`);
    await expect(page.locator('input#name')).toHaveValue(pet.name);
    // Angular displays the moment adapter format (YYYY/MM/DD), React the native date value.
    await expect(page.locator('input[name="birthDate"]')).toHaveValue(/^2018[-/]12[-/]31$/);

    await page.locator('input#name').fill(newName);
    await ui.fillDate('birthDate', '2020-01-01');
    await page.locator('select#type').selectOption({ label: 'cat' });
    await ui.button('Update Pet').click();
    await ui.expectAppPath(`/owners/${owner.id}`);

    const petRow = page.locator('dl.dl-horizontal', { hasText: newName });
    await expect(petRow).toContainText('2020-01-01');
    await expect(petRow).toContainText('cat');
    const stored = await api.getPet(pet.id!);
    expect(stored.birthDate).toBe('2020-01-01');
    expect(stored.name).toBe(newName);
    await ui.snapshot('J05-pet-edit');
  });

  test('J06 visit add from the pet row on owner detail', async ({ ui, api, cleanup, page }) => {
    const owner = await api.createOwner();
    cleanup(() => api.removeOwner(owner.id!));
    const pet = await api.createPet(owner.id!);
    const description = uniq('Rabies');

    await ui.goto(`/owners/${owner.id}`);
    const petRow = page.locator('dl.dl-horizontal', { hasText: pet.name });
    await petRow.getByRole('button', { name: 'Add Visit' }).click();
    await ui.expectAppPath(`/pets/${pet.id}/visits/add`);
    await expect(ui.heading('New Visit')).toBeVisible();
    const petTable = page.locator('table').first();
    await expect(petTable).toContainText(pet.name);
    await expect(petTable).toContainText(pet.birthDate);
    await expect(petTable).toContainText(`${owner.firstName} ${owner.lastName}`);
    await expect(ui.button('Add Visit')).toBeDisabled();

    await ui.fillDate('date', '2024-02-29');
    await page.locator('input#description').fill(description);
    await expect(ui.button('Add Visit')).toBeEnabled();
    await ui.button('Add Visit').click();
    await ui.expectAppPath(`/owners/${owner.id}`);
    const visitRow = page.locator('table.table-condensed tr', { hasText: description });
    await expect(visitRow).toContainText('2024-02-29');

    const stored = await api.getPet(pet.id!);
    expect(stored.visits?.map((visit) => visit.date)).toContain('2024-02-29');
    await ui.snapshot('J06-visit-add');
  });
});
