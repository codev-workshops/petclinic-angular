import { expect, test, uniq } from '../fixtures';

test.describe('pet types', () => {
  test('J11 pettype add', async ({ ui, api, cleanup, page }) => {
    const name = uniq('type');

    await ui.goto('/pettypes');
    await expect(ui.heading('Pet Types')).toBeVisible();
    await expect(page.locator('table#pettypes tbody tr').first()).toBeVisible();
    await ui.button('Add').click();
    await expect(ui.heading('New Pet Type')).toBeVisible();
    await expect(ui.button('Save')).toBeDisabled();
    await page.locator('input#name').fill(name);
    await expect(ui.button('Save')).toBeEnabled();
    await ui.button('Save').click();

    await ui.expectAppPath('/pettypes');
    await expect.poll(() => ui.tableInputValues('table#pettypes')).toContain(name);
    const created = (await api.getPetTypes()).find((type) => type.name === name);
    expect(created).toBeTruthy();
    cleanup(() => api.delete(`/pettypes/${created?.id}`));
    await ui.snapshot('J11-pettype-add');
  });

  test('J12 pettype edit', async ({ ui, api, cleanup, page }) => {
    const type = await api.createPetType();
    cleanup(() => api.delete(`/pettypes/${type.id}`));
    const newName = uniq('renamed');

    await ui.goto('/pettypes');
    const row = await ui.tableRowWithValue('table#pettypes', type.name);
    await row.getByRole('button', { name: 'Edit' }).click();
    await ui.expectAppPath(`/pettypes/${type.id}/edit`);
    await expect(ui.heading('Edit Pet Type')).toBeVisible();
    await expect(page.locator('input#name')).toHaveValue(type.name);
    await page.locator('input#name').fill(newName);
    await ui.button('Update').click();
    await ui.expectAppPath('/pettypes');
    await expect.poll(() => ui.tableInputValues('table#pettypes')).toContain(newName);
    expect((await api.getPetTypes()).find((t) => t.id === type.id)?.name).toBe(newName);
    await ui.snapshot('J12-pettype-edit');
  });

  test('J13 pettype delete', async ({ ui, api }) => {
    const type = await api.createPetType();

    await ui.goto('/pettypes');
    const row = await ui.tableRowWithValue('table#pettypes', type.name);
    await row.getByRole('button', { name: 'Delete' }).click();
    await expect.poll(() => ui.tableInputValues('table#pettypes')).not.toContain(type.name);
    await expect.poll(async () => (await api.getPetTypes()).some((t) => t.id === type.id)).toBe(false);
    await ui.snapshot('J13-pettype-delete');
  });
});

test.describe('specialties', () => {
  test('J14 specialty edit; specialties/add is not routed', async ({ ui, api, cleanup, page }) => {
    const specialty = await api.createSpecialty();
    cleanup(() => api.delete(`/specialties/${specialty.id}`));
    const newName = uniq('surgery');

    await ui.goto('/specialties');
    await expect(ui.heading('Specialties')).toBeVisible();
    const row = await ui.tableRowWithValue('table#specialties', specialty.name);
    await row.getByRole('button', { name: 'Edit' }).click();
    await ui.expectAppPath(`/specialties/${specialty.id}/edit`);
    await expect(ui.heading('Edit Specialty')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toHaveValue(specialty.name);
    await page.locator('input[name="name"]').fill(newName);
    await ui.button('Update').click();
    await ui.expectAppPath('/specialties');
    await expect.poll(() => ui.tableInputValues('table#specialties')).toContain(newName);
    expect((await api.getSpecialties()).find((s) => s.id === specialty.id)?.name).toBe(newName);
    await ui.snapshot('J14-specialty-edit');

    await ui.goto('/specialties/add');
    await expect(ui.heading('Oops! Page not found !')).toBeVisible();
    await expect(ui.heading('Not Found - 404 error')).toBeVisible();
  });
});
