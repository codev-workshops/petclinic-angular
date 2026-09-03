import { expect, test, uniq } from '../fixtures';

/** Angular `app.component.html` nav links (the oracle) and the heading each one must land on. */
const NAV_LINKS: Array<{ href: string; heading: string }> = [
  { href: '/welcome', heading: 'Welcome' },
  { href: '/owners', heading: 'Owners' },
  { href: '/owners/add', heading: 'New Owner' },
  { href: '/vets', heading: 'Veterinarians' },
  { href: '/vets/add', heading: 'New Veterinarian' },
  { href: '/pettypes', heading: 'Pet Types' },
  { href: '/specialties', heading: 'Specialties' },
];

test.describe('application shell', () => {
  test('J15 wildcard route renders the not-found page', async ({ ui, page }) => {
    await ui.goto(`/${uniq('nowhere')}/${uniq('x')}`);
    await expect(ui.heading('Oops! Page not found !')).toBeVisible();
    await expect(ui.heading('Not Found - 404 error')).toBeVisible();
    await expect(page.locator('nav.navbar')).toBeVisible();
    await ui.snapshot('J15-not-found');
  });

  test('J16 every nav link lands on the same route as Angular', async ({ ui, page }) => {
    await ui.goto('/welcome');
    const hrefs = await page
      .locator('nav.navbar a[href]')
      .evaluateAll((anchors) =>
        anchors
          .map((a) => new URL((a as HTMLAnchorElement).href).pathname.replace(/^\/petclinic/, ''))
          .filter((href) => href !== '' && href !== '/' && href !== '/#'),
      );
    expect([...new Set(hrefs)].sort()).toEqual(NAV_LINKS.map((link) => link.href).sort());

    for (const link of NAV_LINKS) {
      await ui.goto('/welcome');
      const anchor = page.locator(`nav.navbar a[href$="${link.href}"]`).first();
      if (!(await anchor.isVisible())) {
        // Owners / Veterinarians dropdown entries: open the menu first.
        await anchor.locator('xpath=ancestor::li[contains(@class,"dropdown")]//*[contains(@class,"dropdown-toggle")]').click();
      }
      await anchor.click();
      await ui.expectAppPath(link.href);
      await expect(ui.heading(link.heading)).toBeVisible();
    }
    await ui.snapshot('J16-nav-links');
  });

  test('J17 Spring `errors` header message is surfaced on owner edit', async ({ ui, api, cleanup, page }) => {
    const owner = await api.createOwner();
    cleanup(() => api.removeOwner(owner.id!));
    const message = 'must be a valid telephone number (parity mock)';

    // spring-petclinic-rest >= 3.x answers validation failures with an RFC 7807 body only;
    // the legacy `errors` header both apps parse is reproduced deterministically here.
    await page.route(`**/petclinic/api/owners/${owner.id}`, async (route) => {
      if (route.request().method() !== 'PUT') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          errors: JSON.stringify([{ objectName: 'owner', fieldName: 'telephone', fieldValue: '', errorMessage: message }]),
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Expose-Headers': 'errors',
        },
        body: JSON.stringify({ title: 'Bad Request', status: 400 }),
      });
    });

    await ui.goto(`/owners/${owner.id}/edit`);
    await expect(page.locator('input#telephone')).toHaveValue(owner.telephone);
    await page.locator('input#telephone').fill('5550000000');
    await ui.button('Update Owner').click();
    await expect(ui.errorAlert()).toContainText(message);
    await ui.expectAppPath(`/owners/${owner.id}/edit`);
    await ui.snapshot('J17-errors-header');
  });
});
