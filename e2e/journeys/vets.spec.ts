import { expect, test, uniq } from '../fixtures';

test.describe('vets', () => {
  test('J07 vet list shows every vet with its specialties', async ({ ui, api, page }) => {
    const vets = await api.getVets();

    await ui.goto('/vets');
    await expect(ui.heading('Veterinarians')).toBeVisible();
    await expect(page.locator('table#vets tbody tr')).toHaveCount(vets.length);
    for (const vet of vets) {
      const row = page.locator('table#vets tbody tr', { hasText: `${vet.firstName} ${vet.lastName}` });
      await expect(row).toBeVisible();
      for (const spec of vet.specialties) {
        await expect(row).toContainText(spec.name);
      }
      await expect(row.getByRole('button', { name: 'Edit Vet' })).toBeVisible();
      await expect(row.getByRole('button', { name: 'Delete Vet' })).toBeVisible();
    }
    await expect(ui.button('Home')).toBeVisible();
    await expect(ui.button('Add Vet')).toBeVisible();
    await ui.snapshot('J07-vet-list');
  });

  test('J08 vet add', async ({ ui, api, cleanup, page }) => {
    const firstName = uniq('Vet');
    const lastName = uniq('Added');
    const [specialty] = await api.getSpecialties();

    await ui.goto('/vets');
    await ui.button('Add Vet').click();
    await ui.expectAppPath('/vets/add');
    await expect(ui.heading('New Veterinarian')).toBeVisible();
    await expect(ui.button('Save Vet')).toBeDisabled();
    await page.locator('input#firstName').fill(firstName);
    await page.locator('input#lastName').fill(lastName);
    await page.locator('select#specialties').selectOption({ label: specialty.name });
    await expect(ui.button('Save Vet')).toBeEnabled();
    await ui.button('Save Vet').click();
    await ui.expectAppPath('/vets');

    const row = page.locator('table#vets tbody tr', { hasText: `${firstName} ${lastName}` });
    await expect(row).toBeVisible();
    await expect(row).toContainText(specialty.name);
    const created = (await api.getVets()).find((vet) => vet.firstName === firstName);
    expect(created?.specialties.map((spec) => spec.name)).toEqual([specialty.name]);
    cleanup(() => api.delete(`/vets/${created?.id}`));
    await ui.snapshot('J08-vet-add');
  });

  test('J09 vet edit is pre-loaded by the resolver (no loading flash) and saves specialties', async ({
    ui,
    api,
    cleanup,
    page,
  }) => {
    const specialties = await api.getSpecialties();
    const vet = await api.createVet({ specialties: [specialties[0]] });
    cleanup(() => api.delete(`/vets/${vet.id}`));

    // Record whether a loading indicator was ever painted before the form appeared.
    await page.addInitScript(() => {
      const w = window as unknown as { __loadingSeen: boolean };
      w.__loadingSeen = false;
      const check = () => {
        if (document.querySelector('.loading-indicator, [role="status"]') || /Loading/.test(document.body?.innerText ?? '')) {
          w.__loadingSeen = true;
        }
      };
      new MutationObserver(check).observe(document.documentElement, { childList: true, subtree: true });
    });

    await page.goto(`vets/${vet.id}/edit`, { waitUntil: 'domcontentloaded' });
    const firstName = page.locator('input#firstName');
    await firstName.waitFor();
    // Fields are populated on first paint: the value is present synchronously with the input.
    expect(await firstName.inputValue()).toBe(vet.firstName);
    expect(await page.locator('input#lastName').inputValue()).toBe(vet.lastName);
    expect(await ui.selectedVetEditSpecialties()).toEqual([specialties[0].name]);
    expect(await page.evaluate(() => (window as unknown as { __loadingSeen: boolean }).__loadingSeen)).toBe(false);
    await expect(ui.heading('Edit Veterinarian')).toBeVisible();

    const newLastName = uniq('Edited');
    await page.locator('input#lastName').fill(newLastName);
    await ui.chooseVetEditSpecialties([specialties[0].name, specialties[1].name]);
    await ui.button('Save Vet').click();
    await ui.expectAppPath('/vets');
    const row = page.locator('table#vets tbody tr', { hasText: `${vet.firstName} ${newLastName}` });
    await expect(row).toContainText(specialties[0].name);
    await expect(row).toContainText(specialties[1].name);

    const stored = await api.getVet(vet.id!);
    expect(stored.lastName).toBe(newLastName);
    expect(stored.specialties.map((spec) => spec.name).sort()).toEqual([specialties[0].name, specialties[1].name].sort());
    await ui.snapshot('J09-vet-edit');
  });

  test('J10 vet delete', async ({ ui, api, page }) => {
    const vet = await api.createVet();
    const fullName = `${vet.firstName} ${vet.lastName}`;

    await ui.goto('/vets');
    const row = page.locator('table#vets tbody tr', { hasText: fullName });
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: 'Delete Vet' }).click();
    await expect(row).toHaveCount(0);
    await expect.poll(async () => (await api.getVets()).some((v) => v.id === vet.id)).toBe(false);
    await ui.snapshot('J10-vet-delete');
  });
});
