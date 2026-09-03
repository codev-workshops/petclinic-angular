import { test as base, expect } from '@playwright/test';
import type { APIRequestContext, Locator, Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { API_BASE_URL } from '../playwright.config';

/** Screenshot folder under `e2e/__screenshots__`; `angular/` is the frozen historical reference. */
const SCREENSHOT_TARGET = 'react';

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

/** Unique, letters-only suffix so entities created per run never collide (name patterns are `^[a-zA-Z]*$`). */
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
 * Page helpers shared by every journey. The journeys were written against the Angular app
 * (Material date picker / mat-select); the React widgets they map to (native inputs) are
 * listed in docs/migration/PARITY.md.
 */
export class Ui {
  constructor(readonly page: Page) {}

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
   * Current input values of the read-only name inputs in a pet type / specialty list table
   * (controlled inputs: DOM property, no `value` attribute, so CSS attribute selectors cannot be used).
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

  /** `.help-block` validation messages inside the current form. */
  helpBlocks(): Locator {
    return this.page.locator('form .help-block');
  }

  /** `ErrorAlert`: the danger alert surfacing API errors. */
  errorAlert(): Locator {
    return this.page.locator('.alert.alert-danger');
  }

  /** Type a calendar date into the native `<input type="date">` (`YYYY-MM-DD`). */
  async fillDate(name: string, isoDate: string): Promise<void> {
    await this.page.locator(`input[name="${name}"]`).fill(isoDate);
  }

  /** Select specialties on the vet edit form (`<select multiple>`). */
  async chooseVetEditSpecialties(names: string[]): Promise<void> {
    await this.page.locator('select#specialties').selectOption(names.map((label) => ({ label })));
  }

  /** Selected specialty names on the vet edit form. */
  async selectedVetEditSpecialties(): Promise<string[]> {
    return this.page
      .locator('select#specialties option:checked')
      .evaluateAll((options) => options.map((option) => option.textContent?.trim() ?? ''));
  }

  /** Viewport screenshot of the journey end state, compared against `angular/` by the pixel diff. */
  async snapshot(name: string): Promise<void> {
    const dir = path.join(__dirname, '__screenshots__', SCREENSHOT_TARGET);
    mkdirSync(dir, { recursive: true });
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.page.screenshot({ path: path.join(dir, `${name}.png`), animations: 'disabled', caret: 'hide' });
  }
}

interface Fixtures {
  api: Api;
  ui: Ui;
  /** Registered cleanups run after the test in reverse order (best effort). */
  cleanup: (fn: () => Promise<void>) => void;
}

export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => {
    await use(new Api(request));
  },
  ui: async ({ page }, use) => {
    await use(new Ui(page));
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
