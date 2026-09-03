# Parity report (Phase 3)

The Playwright parity suite in `e2e/journeys/**` runs every journey against the Angular app
(`npm run ng:start`, `http://localhost:4200/petclinic/`) and the React app (`npm run dev`,
`http://localhost:5173/petclinic/`), both against the same real spring-petclinic-rest backend
(`docker run -d --name petclinic-rest -p 9966:9966 springcommunity/spring-petclinic-rest`).

```bash
npm run test:e2e              # React (default)   -> 22 passed
npm run test:e2e:angular      # Angular            -> 22 passed
npm run test:e2e:both         # both projects      -> 44 passed
npm run test:e2e:visual-diff  # pixelmatch report  -> e2e/__screenshots__/report.md + diff/
TARGET=react REACT_BASE_URL=http://localhost:8080/petclinic/ npm run test:e2e   # prod Docker image -> 22 passed
```

Each journey ends with `ui.snapshot(name)` (1280×900, animations disabled) written to
`e2e/__screenshots__/{angular,react}/<name>.png`; `e2e/visual-diff.mjs` compares the pairs with
`pixelmatch` (threshold 0.2, size-padded) and writes `e2e/__screenshots__/diff/<name>.png`.

## Per-journey results (run 2026-09-03, backend image `springcommunity/spring-petclinic-rest`)

| # | Journey (spec) | Angular | React | Visual diff | Notes |
|---|---|---|---|---|---|
| J01 | Owner search → detail → add pet → add visit (`owners.spec.ts`) | pass | pass | 14.17% | Same pet/visit rows, dates `YYYY-MM-DD`. Diff = navbar (see V1) |
| J02 | Owner add (`owners.spec.ts`) | pass | pass | 14.16% | **Intentional:** Angular returns to `/owners`; React navigates to the new owner's detail (`AGENTS.md` "navigate to the detail view of the created resource"). Test asserts each app's own target |
| J03 | Owner edit (`owners.spec.ts`) | pass | pass | 6.57% | |
| J04 | Owner search by lastName incl. not-found (`owners.spec.ts`) | pass | pass | 4.55% | Both show the "not found" copy only after load |
| J05 | Pet edit, birthDate round-trip (`pets-visits.spec.ts`) | pass | pass | 9.92% | Angular: MatDatepicker text `YYYY/MM/DD`; React: `<input type="date">`. Both persist `YYYY-MM-DD` (asserted via API) |
| J06 | Visit add from pet row (`pets-visits.spec.ts`) | pass | pass | 14.16% | Visit date persisted `YYYY-MM-DD` |
| J07 | Vet list (`vets.spec.ts`) | pass | pass | 10.85% | Same rows, specialties joined identically |
| J08 | Vet add (`vets.spec.ts`) | pass | pass | 3.97% | Angular `mat-select` vs React native `<select multiple>` |
| J09 | Vet edit with resolver preload (`vets.spec.ts`) | pass | pass | 4.66% | `MutationObserver` from `domcontentloaded`: no loading indicator / "Loading" text ever appeared; firstName/lastName/specialties populated on first paint in both |
| J10 | Vet delete (`vets.spec.ts`) | pass | pass | 10.85% | Row removed; API confirms 404 |
| J11 | Pet type add (`pettypes-specialties.spec.ts`) | pass | pass | 3.23% | |
| J12 | Pet type edit (`pettypes-specialties.spec.ts`) | pass | pass | 3.22% | |
| J13 | Pet type delete (`pettypes-specialties.spec.ts`) | pass | pass | 3.17% | |
| J14 | Specialty edit + `/specialties/add` → 404 page (`pettypes-specialties.spec.ts`) | pass | pass | 16.37% | Both render "Oops! Page not found !" for `/specialties/add`. React input id is a `useId()` value; test selects by `name="name"`. Diff = V1 + V2 |
| J15 | Wildcard not-found for random URL (`shell.spec.ts`) | pass | pass | 7.94% | Rendered inside layout (navbar + footer) in both |
| J16 | Nav link parity (`shell.spec.ts`) | pass | pass | 18.11% | All 7 links (Home, Owners▸Search/Add, Vets▸All/Add, Pet Types, Specialties) land on the same route + heading. Diff = V1 + V2 |
| J17 | Server `errors`-header message surfacing (`shell.spec.ts`) | pass | pass | 6.97% | `PUT /owners/{id}` mocked with Playwright `route` → 400 + `errors: [{errorMessage}]` header; both show the text in a dismissable alert. See "Backend note" |
| J18a | Validation — owner (`validation.spec.ts`) | pass | pass | 6.07% | required-only on empty; telephone pattern; maxlength 30/255/80/12 |
| J18b | Validation — vet (`validation.spec.ts`) | pass | pass | 5.45% | Identical copy ("First name is required") in both |
| J18c | Validation — pet type (`validation.spec.ts`) | pass | pass | 4.21% | |
| J18d | Validation — pet (`validation.spec.ts`) | pass | pass | 5.12% | |
| J18e | Validation — visit (`validation.spec.ts`) | pass | pass | 18.11% | Description maxlength 255 message. Diff = V1 + V2 |

**Functional parity: 22/22 journeys pass on both apps.** No journey had to be marked as a
React functional bug. The visual diff never reaches 0% because the two apps use different
widget implementations (Angular Material `mat-select`/datepicker vs native controls) and
different fonts/anti-aliasing; anything ≥ 10% is explained by the two React visual findings
below.

### React findings (visual only — not fixed in Phase 3, feature code is frozen)

| Id | Finding | Repro | Owning feature |
|---|---|---|---|
| V1 | Navbar `Owners` / `Veterinarians` dropdown toggles render with no visible label text at 1280 px (the `<button class="dropdown-toggle btn-link">` does not pick up Bootstrap 3's `.navbar-nav > li > a` colour despite `src/components/NavBar.css`); the navbar also renders narrower than the viewport instead of full width like Angular | Open any page, compare `e2e/__screenshots__/{angular,react}/J16-nav-links.png` | shared shell — `src/components/NavBar.tsx` (touches all clusters; suggest owners-pets-visits cluster owns the fix) |
| V2 | Extra empty vertical band (~100–200 px) between the navbar and the page heading on Specialties, Pet Types, New Visit (see `react/J16-nav-links.png`, `react/J18e-validation-visit.png`); Owner detail has no such band | Navigate to `/specialties` or `/owners/:id/pets/:petId/visits/add` | specialties, pettypes, owners-pets-visits (page containers) |

### Intentional deviations

| Behaviour | Angular | React | Decision |
|---|---|---|---|
| After owner create | `/owners` list | `/owners/:id` detail | Keep React (AGENTS.md navigation standard) |
| Date inputs | MatDatepicker (`YYYY/MM/DD` text) | native `<input type="date">` | Keep React; wire format `YYYY-MM-DD` identical |
| Vet specialties picker | `mat-select multiple` | native `<select multiple>` | Keep React |
| Specialty edit input id | `id="name"` | `useId()` + `name="name"` | Keep React; label association verified |

### Backend note (J17)

Against the live `springcommunity/spring-petclinic-rest` image an invalid owner returns
`400` with an RFC-7807 body but **no `errors` response header**, so the legacy header-based
message path cannot be triggered end-to-end. J17 therefore mocks the `PUT` with a Playwright
`route` that returns the documented `errors` header and asserts both apps surface
`errors[0].errorMessage`.

Also observed: `DELETE /owners/{id}` / `DELETE /pets/{id}` on that image cascade to the pet's
*type* row, so `e2e/fixtures.ts` never deletes owners that still have pets (entities are
uniquely named per run instead).

## Global (Phase 2 checklist — verified by J15/J16/J17/J04)

| Behaviour | Angular | React |
|---|---|---|
| `/petclinic/` and `/petclinic/welcome` render "Welcome to Petclinic" + pets image | | |
| Unknown path renders "Oops! Page not found !" inside the layout | | |
| Nav bar: Home, Owners (Search / Add New), Veterinarians (All / Add New), Pet Types, Specialties | | |
| Pet Types / Specialties nav items get `active` on their routes | | |
| Footer shows Angular + Pivotal logos | | |
| API error → visible, dismissable alert containing the Spring `errors[0].errorMessage` | | |
| Network failure → visible error, no unhandled promise rejection | | |
| Empty list copy only after the initial load completed | | |

## Validation rules (transcribed from each `*.component.html`)

Shared Angular semantics that React must reproduce:

- Angular `pattern` is anchored: the validator wraps the attribute value in `^...$`
  (already written that way in the templates).
- `pattern` and `minlength` **pass on the empty string**; only `required` fails on empty.
  So an empty required field shows exactly one message ("… is required").
- `maxlength` on `<input>` also *truncates* typing in the browser; the validator only fails
  for pre-filled longer values.
- Field messages (`help-block`) render only when the control is **dirty**
  (`field.dirty && field.hasError(...)`); `has-success`/`has-error` classes likewise.
  Exception: `vet-add` also shows the *required* message after submit
  (`vetForm.submitted && firstName.hasError('required')`).
- The submit button is `[disabled]="!form.valid"` on every add/edit form.
- `owner-edit` and `vet-edit` also show `glyphicon-ok` / `glyphicon-remove` feedback icons.

### Owner add / edit (`owners/owner-add`, `owners/owner-edit`)

| Field | Rules | Messages |
|---|---|---|
| firstName | required, minlength 1, maxlength 30, pattern `^[a-zA-Z]*$` | "First name is required", "First name must be at least 1 characters long", "First name may be at most 30 characters long", "First name must consist of letters only" |
| lastName | required, minlength 1, maxlength 30, pattern `^[a-zA-Z]*$` | "Last name is required", "… at least 1 characters long", "… at most 30 characters long", "Last name must consist of letters only" |
| address | required, maxlength 255 | "Address is required", "Address may be at most 255 characters long" |
| city | required, maxlength 80 | "City is required", "City may be at most 80 characters long" |
| telephone | required, minlength 1, maxlength 20, pattern `^[0-9]*$` | "Phone number is required", "Phone number cannot be more than 20 digits long", "Phone number only accept digits" |

Owner list search (`owner-list`): `lastName` input `maxlength="80"`, no other validation;
empty search lists all owners. Buttons: "Add Owner" / "Update Owner" (edit, disabled while invalid).

### Pet add / edit (`pets/pet-add`, `pets/pet-edit`)

| Field | Rules | Messages |
|---|---|---|
| owner | read-only text `"{firstName} {lastName}"` | – |
| name | required, minlength 1, maxlength 30, pattern `^[A-Za-z0-9].{0,29}$` | "Name is required", "Name must be at least 1 character long", "Name may be at most 30 character long", "Name must begin with a letter" |
| birthDate | required (`<input type="date">`, value `YYYY-MM-DD`) | "BirthDate is required" |
| type | required (`<select>` of pet types; read-only text of current type on edit) | "pettype is required" |

Buttons: "Save Pet" (add) / "Update Pet" (edit), `disabled` while invalid; "Back".

### Visit add / edit (`visits/visit-add`, `visits/visit-edit`)

| Field | Rules | Messages |
|---|---|---|
| pet / owner | read-only display of pet name and owner | – |
| date | required (`YYYY-MM-DD`, local) | "Date is required" |
| description | required, minlength 1, maxlength 255 | "Description is required", "Description must be at least 1 characters long", "Description may be at most 255 characters long" (visit-edit also contains a duplicated "charaters" typo variant) |

Buttons: "Add Visit" / "Update Visit" (`disabled` while invalid).

### Vet add / edit (`vets/vet-add`, `vets/vet-edit`)

| Field | Rules | Messages |
|---|---|---|
| firstName | required, minlength 1, maxlength 30, pattern `^[a-zA-Z]*$` (edit: `^[A-Za-z]*$`, equivalent) | "First name is required" (add: also after submit), "First Name must be at least 1 characters long", "First Name may be only 30 characters long", "First Name may only consist of letters" |
| lastName | required, minlength 1, maxlength 30, pattern `^[a-zA-Z]*$` | "Last name is required", "Last Name must be at least 1 characters long", "Last Name may be only 30 characters long", "Last Name may only consist of letters" |
| specialties | multi-select of all specialties (edit route pre-loads `vet` + `specs` via resolvers) | – |

Buttons: "Save Vet" (both; edit is `disabled` on `vetEditForm.invalid`).

### Pet type add / edit (`pettypes/pettype-add`, `pettypes/pettype-edit`)

| Field | Rules | Messages |
|---|---|---|
| name | required, minlength 1, maxlength 80, pattern `^[A-Za-z0-9].{0,79}$` | "Name is required" (edit only; add has no required message), "Name may be at least 1 characters long" (sic), "Name may be only 80 characters long", "Name must begin with a letter or digit" |

Buttons: "Save" (add) / "Update" (edit), `disabled` while invalid.

### Specialty add / edit (`specialties/specialty-add`, `specialties/specialty-edit`)

| Field | Rules | Messages |
|---|---|---|
| name | required, minlength 1, maxlength 80, pattern `^[A-Za-z0-9].{0,79}$` | "Name is required", "Name must be at least 1 characters long", "Name may be only 80 characters long", "Name must begin with a letter or digit" |

`specialty-add` is rendered inline on the list page (no route). Buttons: "Save" / "Update",
`disabled` while invalid.

## Per-feature flows (fill during Waves 1–2, verify in Wave 3)

| Flow | Angular | React |
|---|---|---|
| Owners: list → search by last name → detail → edit → delete | | |
| Owners: add owner → redirected to detail | | |
| Owners: detail → add pet (`owners/:id/pets/add`) → pet appears | | |
| Pets: list, edit (`pets/:id/edit`), delete, add visit (`pets/:id/visits/add`) | | |
| Visits: list, add, edit, delete | | |
| Vets: list (with specialties), add, edit (pre-loaded vet + specialties), delete | | |
| Pet types: list, add, edit, delete | | |
| Specialties: list with inline add, edit, delete | | |
| Direct URL access to every add/edit route (fresh tab) | | |
| Back buttons return to the previous page (fallback route when no history) | | |
