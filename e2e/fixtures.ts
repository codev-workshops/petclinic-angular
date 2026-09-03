import { test as base, expect } from '@playwright/test';
import type { APIRequestContext, Locator, Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { API_BASE_URL } from '../playwright.config';
import type { Target } from '../playwright.config';

export { expect };

export interface Owner {
  id?: number;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  telephone: string;
  pets?: Pet[];
}

export interface PetType {
  id?: number;
  name: string;
}

export interface Pet {
  id?: number;
  name: string;
  birthDate: string;
  type: PetType;
  ownerId?: number;
  visits?: Visit[];
}

export interface Visit {
  id?: number;
  date: string;
  description: string;
  petId?: number;
}

export interface Specialty {
  id?: number;
  name: string;
}

export interface Vet {
  id?: number;
  firstName: string;
  lastName: string;
  specialties: Specialty[];
}

/** Unique, letters-only suffix so entities created per run never collide (both apps' patterns are `^[a-zA-Z]*$`). */
export function uniq(prefix: string): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let n = Date.now() % 1_000_000_000;
  let out = '';
  while (n > 0) {
    out = alphabet[n % 26] + out;
    n = Math.floor(n / 26);
  }
  return `${prefix}${out}`;
}

/** Thin client for the spring-petclinic-rest API: fixtures + cleanup live outside the UI under test. */
export class Api {
  constructor(private readonly request: APIRequestContext) {}

  private async json<T>(method: 'get' | 'post' | 'put', url: string, data?: unknown): Promise<T> {
    const response = await this.request[method](`${API_BASE_URL}${url}`, data === undefined ? undefined : { data });
    expect(response.ok(), `${method.toUpperCase()} ${url} -> ${response.status()}`).toBeTruthy();
    return (await response.json()) as T;
  }

  async delete(url: string): Promise<void> {
    await this.request.delete(`${API_BASE_URL}${url}`);
  }

  /**
   * spring-petclinic-rest cascades `DELETE /owners/{id}` and `DELETE /pets/{id}` to the pet's
   * *type* row (`delete from types where id=?`), wiping shared reference data. Owners that
   * still have pets are therefore left behind (they carry unique names) instead of deleted.
   */
  async removeOwner(id: number): Promise<void> {
    const response = await this.request.get(`${API_BASE_URL}/owners/${id}`);
    if (!response.ok()) {
      return;
    }
    const owner = (await response.json()) as Owner;
    if ((owner.pets ?? []).length === 0) {
      await this.delete(`/owners/${id}`);
    }
  }

  createOwner(overrides: Partial<Owner> = {}): Promise<Owner> {
    return this.json<Owner>('post', '/owners', {
      firstName: uniq('Fn'),
      lastName: uniq('Ln'),
      address: '1 Parity Street',
      city: 'Madison',
      telephone: '6085551023',
      ...overrides,
    });
  }

  getOwner(id: number): Promise<Owner> {
    return this.json<Owner>('get', `/owners/${id}`);
  }

  getPetTypes(): Promise<PetType[]> {
    return this.json<PetType[]>('get', '/pettypes');
  }

  async createPet(ownerId: number, overrides: Partial<Pet> = {}): Promise<Pet> {
    const [type] = await this.getPetTypes();
    return this.json<Pet>('post', `/owners/${ownerId}/pets`, {
      name: uniq('Pet'),
      birthDate: '2019-04-11',
      type,
      ...overrides,
    });
  }

  getPet(id: number): Promise<Pet> {
    return this.json<Pet>('get', `/pets/${id}`);
  }

  createPetType(name = uniq('Type')): Promise<PetType> {
    return this.json<PetType>('post', '/pettypes', { name });
  }

  getSpecialties(): Promise<Specialty[]> {
    return this.json<Specialty[]>('get', '/specialties');
  }

  createSpecialty(name = uniq('spec')): Promise<Specialty> {
    return this.json<Specialty>('post', '/specialties', { name });
  }

  getVets(): Promise<Vet[]> {
    return this.json<Vet[]>('get', '/vets');
  }

  getVet(id: number): Promise<Vet> {
    return this.json<Vet>('get', `/vets/${id}`);
  }

  async createVet(overrides: Partial<Vet> = {}): Promise<Vet> {
    const specialties = await this.getSpecialties();
    return this.json<Vet>('post', '/vets', {
      firstName: uniq('Vf'),
      lastName: uniq('Vl'),
      specialties: specialties.slice(0, 1),
      ...overrides,
    });
  }
}

/**
 * The two apps render the same information with a few known widget differences
 * (Angular Material date picker / mat-select vs. native inputs). `Ui` hides those so a
 * journey reads identically for both targets; every difference lives here and is listed in
 * docs/migration/PARITY.md.
 */
export class Ui {
  constructor(
    readonly page: Page,
    readonly target: Target,
  ) {}

  /** Navigate to an app path (relative to `/petclinic/`) and wait for the layout to mount. */
  async goto(appPath: string): Promise<void> {
    await this.page.goto(appPath.replace(/^\//, ''));
    await expect(this.page.locator('nav.navbar')).toBeVisible();
  }

  /** Path part of the current URL below `/petclinic`. */
  appPath(): string {
    const { pathname } = new URL(this.page.url());
    return pathname.replace(/^\/petclinic/, '') || '/';
  }

  async expectAppPath(expected: string | RegExp): Promise<void> {
    await expect
      .poll(() => this.appPath(), { message: `expected app path ${String(expected)}` })
      .toMatch(typeof expected === 'string' ? new RegExp(`^${expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) : expected);
  }

  heading(text: string): Locator {
    return this.page.getByRole('heading', { name: text, exact: true });
  }

  button(name: string): Locator {
    return this.page.getByRole('button', { name, exact: true }).first();
  }

  /**
   * Current input values of the read-only name inputs in a pet type / specialty list table.
   * Angular binds `[(ngModel)]` (DOM property, no `value` attribute), so CSS attribute
   * selectors cannot be used here.
   */
  tableInputValues(tableSelector: string): Promise<string[]> {
    return this.page
      .locator(`${tableSelector} tbody tr input`)
      .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
  }

  /** Row of a list table whose input currently holds `value`. */
  async tableRowWithValue(tableSelector: string, value: string): Promise<Locator> {
    await expect.poll(() => this.tableInputValues(tableSelector)).toContain(value);
    const index = (await this.tableInputValues(tableSelector)).indexOf(value);
    return this.page.locator(`${tableSelector} tbody tr`).nth(index);
  }

  /** Bootstrap `.help-block` validation messages inside the current form. */
  helpBlocks(): Locator {
    return this.page.locator('form .help-block');
  }

  /** Both apps use a Bootstrap danger alert for API errors (React: ErrorAlert, Angular: owner-edit template). */
  errorAlert(): Locator {
    return this.page.locator('.alert.alert-danger');
  }

  /**
   * Type a calendar date. Angular renders a MatMomentDate input (`YYYY/MM/DD`),
   * React a native `<input type="date">` (`YYYY-MM-DD`). Both submit `YYYY-MM-DD`.
   */
  async fillDate(name: string, isoDate: string): Promise<void> {
    const input = this.page.locator(`input[name="${name}"]`);
    if (this.target === 'angular') {
      await input.fill(isoDate.replace(/-/g, '/'));
      await input.blur();
    } else {
      await input.fill(isoDate);
    }
  }

  /** Select specialties on the vet edit form (Angular: `<mat-select multiple>`, React: `<select multiple>`). */
  async chooseVetEditSpecialties(names: string[]): Promise<void> {
    if (this.target === 'angular') {
      await this.page.locator('mat-select#spec').click();
      const panel = this.page.locator('.mat-mdc-select-panel, .mat-select-panel');
      await expect(panel).toBeVisible();
      for (const option of await panel.getByRole('option').all()) {
        const label = (await option.textContent())?.trim() ?? '';
        const selected = (await option.getAttribute('aria-selected')) === 'true';
        if (names.includes(label) !== selected) {
          await option.click();
        }
      }
      await this.page.keyboard.press('Escape');
      await expect(panel).toBeHidden();
    } else {
      await this.page.locator('select#specialties, select#spec').first().selectOption(names.map((label) => ({ label })));
    }
  }

  /** Selected specialty names on the vet edit form. */
  async selectedVetEditSpecialties(): Promise<string[]> {
    if (this.target === 'angular') {
      const text = (await this.page.locator('mat-select#spec .mat-mdc-select-value-text, mat-select#spec .mat-select-value-text').textContent()) ?? '';
      return text
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return this.page
      .locator('select#specialties option:checked, select#spec option:checked')
      .evaluateAll((options) => options.map((option) => option.textContent?.trim() ?? ''));
  }

  /** Viewport screenshot of the journey end state, stored per target for the pixel diff. */
  async snapshot(name: string): Promise<void> {
    const dir = path.join(__dirname, '__screenshots__', this.target);
    mkdirSync(dir, { recursive: true });
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.page.screenshot({ path: path.join(dir, `${name}.png`), animations: 'disabled', caret: 'hide' });
  }
}

interface Fixtures {
  target: Target;
  api: Api;
  ui: Ui;
  /** Registered cleanups run after the test in reverse order (best effort). */
  cleanup: (fn: () => Promise<void>) => void;
}

export const test = base.extend<Fixtures>({
  target: async ({}, use, testInfo) => {
    await use(testInfo.project.name as Target);
  },
  api: async ({ request }, use) => {
    await use(new Api(request));
  },
  ui: async ({ page, target }, use) => {
    await use(new Ui(page, target));
  },
  cleanup: async ({}, use) => {
    const fns: Array<() => Promise<void>> = [];
    await use((fn) => {
      fns.push(fn);
    });
    for (const fn of fns.reverse()) {
      await fn().catch(() => undefined);
    }
  },
});
