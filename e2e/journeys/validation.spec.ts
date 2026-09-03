import { expect, test, type Ui } from '../fixtures';

/** Angular validators only report after the control is dirty: type then clear to make it dirty. */
async function dirtyEmpty(ui: Ui, selector: string): Promise<void> {
  const input = ui.page.locator(selector);
  await input.fill('x');
  await input.fill('');
  await input.blur();
}

/**
 * Both apps declare `maxlength` on the input. Depending on whether the browser truncates
 * the typed value or the validator reports, the outcome is: value clipped to `max` chars
 * OR the maxlength message shown. Either way the over-long value never reaches the form.
 */
async function expectMaxLength(ui: Ui, selector: string, max: number, message: RegExp): Promise<void> {
  const input = ui.page.locator(selector);
  await input.fill('a'.repeat(max + 1));
  await input.blur();
  const value = await input.inputValue();
  if (value.length > max) {
    await expect(ui.helpBlocks().filter({ hasText: message })).toBeVisible();
  } else {
    expect(value).toHaveLength(max);
  }
}

test.describe('validation parity', () => {
  test('J18a owner form: required only, pattern, maxlength', async ({ ui, page }) => {
    await ui.goto('/owners/add');
    await expect(ui.helpBlocks()).toHaveCount(0);

    await dirtyEmpty(ui, 'input#firstName');
    await expect(ui.helpBlocks()).toHaveCount(1);
    await expect(ui.helpBlocks()).toHaveText(['First name is required']);
    await expect(ui.button('Add Owner')).toBeDisabled();

    await page.locator('input#firstName').fill('John1');
    await expect(ui.helpBlocks()).toHaveText(['First name must consist of letters only']);

    await page.locator('input#telephone').fill('555-1234');
    await expect(ui.helpBlocks().filter({ hasText: 'Phone number only accept digits' })).toBeVisible();

    await page.locator('input#firstName').fill('John');
    await page.locator('input#telephone').fill('5551234');
    await expect(ui.helpBlocks()).toHaveCount(0);

    await expectMaxLength(ui, 'input#lastName', 30, /Last name may be at most 30 characters long/);
    await expectMaxLength(ui, 'input#telephone', 20, /Phone number cannot be more than 20 digits long/);
    await ui.snapshot('J18a-validation-owner');
  });

  test('J18b vet form: required only, pattern, maxlength', async ({ ui, page }) => {
    await ui.goto('/vets/add');
    await expect(ui.helpBlocks()).toHaveCount(0);

    await dirtyEmpty(ui, 'input#firstName');
    await expect(ui.helpBlocks()).toHaveCount(1);
    await expect(ui.helpBlocks()).toContainText(['First name is required']);
    await expect(ui.button('Save Vet')).toBeDisabled();

    await page.locator('input#firstName').fill('Ann3');
    await expect(ui.helpBlocks()).toHaveText(['First Name may only consist of letters']);

    await page.locator('input#firstName').fill('Ann');
    await expect(ui.helpBlocks()).toHaveCount(0);
    await expectMaxLength(ui, 'input#lastName', 30, /Last Name may be only 30 characters long/);
    await ui.snapshot('J18b-validation-vet');
  });

  test('J18c pet type form: required only, pattern, maxlength', async ({ ui, page }) => {
    await ui.goto('/pettypes/add');
    await expect(ui.helpBlocks()).toHaveCount(0);

    await dirtyEmpty(ui, 'input#name');
    await expect(ui.helpBlocks()).toHaveCount(1);
    await expect(ui.helpBlocks()).toContainText(['Name is required']);
    await expect(ui.button('Save')).toBeDisabled();

    await page.locator('input#name').fill('-bad');
    await expect(ui.helpBlocks()).toHaveText(['Name must begin with a letter or digit']);

    await page.locator('input#name').fill('hamster');
    await expect(ui.helpBlocks()).toHaveCount(0);
    await expectMaxLength(ui, 'input#name', 80, /Name may be only 80 characters long/);
    await ui.snapshot('J18c-validation-pettype');
  });

  test('J18d pet form: required only, pattern, maxlength', async ({ ui, api, cleanup, page }) => {
    const owner = await api.createOwner();
    cleanup(() => api.removeOwner(owner.id!));

    await ui.goto(`/owners/${owner.id}/pets/add`);
    await expect(page.locator('input#owner_name')).toHaveValue(`${owner.firstName} ${owner.lastName}`);
    await expect(ui.helpBlocks()).toHaveCount(0);

    await dirtyEmpty(ui, 'input#name');
    await expect(ui.helpBlocks()).toHaveCount(1);
    await expect(ui.helpBlocks()).toHaveText(['Name is required']);
    await expect(ui.button('Save Pet')).toBeDisabled();

    await page.locator('input#name').fill('-rex');
    await expect(ui.helpBlocks()).toHaveText(['Name must begin with a letter']);

    await page.locator('input#name').fill('rex');
    await expect(ui.helpBlocks()).toHaveCount(0);
    await expectMaxLength(ui, 'input#name', 30, /Name may be at most 30 character long/);
    await ui.snapshot('J18d-validation-pet');
  });

  test('J18e visit form: required only, maxlength', async ({ ui, api, cleanup, page }) => {
    const owner = await api.createOwner();
    cleanup(() => api.removeOwner(owner.id!));
    const pet = await api.createPet(owner.id!);

    await ui.goto(`/pets/${pet.id}/visits/add`);
    await expect(page.locator('table').first()).toContainText(pet.name);
    await expect(ui.helpBlocks()).toHaveCount(0);

    await dirtyEmpty(ui, 'input#description');
    await expect(ui.helpBlocks()).toHaveCount(1);
    await expect(ui.helpBlocks()).toHaveText(['Description is required']);
    await expect(ui.button('Add Visit')).toBeDisabled();

    await page.locator('input#description').fill('ok');
    await expect(ui.helpBlocks()).toHaveCount(0);
    await expectMaxLength(ui, 'input#description', 255, /Description may be at most 255 characters long/);
    await ui.snapshot('J18e-validation-visit');
  });
});
