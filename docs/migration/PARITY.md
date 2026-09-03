# Parity report

**Phase 4 (React-only run, 2026-09-03, head of `migration/phase-4-idiomatic`).** Angular is
decommissioned; the Playwright suite in `e2e/journeys/**` now has a single React project and runs
against the real spring-petclinic-rest backend
(`docker run -d --name petclinic-rest -p 9966:9966 springcommunity/spring-petclinic-rest`).
`e2e/__screenshots__/angular/**` is the frozen Phase 3 reference; `react/` and `diff/` were
regenerated from the Phase 4 head.

```bash
npm run dev &  REACT_BASE_URL=http://localhost:5173/petclinic/ npm run test:e2e        # -> 22 passed
npm run test:e2e:visual-diff                                                            # -> e2e/__screenshots__/report.md + diff/
docker build -t petclinic-react . && docker run -d -p 8080:8080 petclinic-react
REACT_BASE_URL=http://localhost:8080/petclinic/ npm run test:e2e                        # prod image -> 22 passed
```

Each journey ends with `ui.snapshot(name)` (1280×900, animations disabled) written to
`e2e/__screenshots__/react/<name>.png`; `e2e/visual-diff.mjs` compares it with the frozen Angular
screenshot (`pixelmatch`, threshold 0.2, size-padded) and writes `e2e/__screenshots__/diff/<name>.png`.

## Per-journey results (React, Phase 4 head)

| # | Journey (spec) | React | Visual diff vs Angular ref | Notes |
|---|---|---|---|---|
| J01 | Owner search → detail → add pet → add visit (`owners.spec.ts`) | pass | 13.64% | Same pet/visit rows, dates `YYYY-MM-DD` |
| J02 | Owner add (`owners.spec.ts`) | pass | 8.13% | **Intentional:** React navigates to the new owner's detail (`AGENTS.md`) |
| J03 | Owner edit (`owners.spec.ts`) | pass | 5.74% | |
| J04 | Owner search by lastName incl. not-found (`owners.spec.ts`) | pass | 3.93% | "not found" copy only after load |
| J05 | Pet edit, birthDate round-trip (`pets-visits.spec.ts`) | pass | 9.51% | native `<input type="date">`, persists `YYYY-MM-DD` |
| J06 | Visit add from pet row (`pets-visits.spec.ts`) | pass | 13.61% | |
| J07 | Vet list (`vets.spec.ts`) | pass | 8.22% | |
| J08 | Vet add (`vets.spec.ts`) | pass | 8.85% | native `<select multiple>` |
| J09 | Vet edit with resolver preload (`vets.spec.ts`) | pass | 9.10% | no loading indicator ever appears; fields populated on first paint |
| J10 | Vet delete (`vets.spec.ts`) | pass | 8.22% | |
| J11 | Pet type add (`pettypes-specialties.spec.ts`) | pass | 10.00% | |
| J12 | Pet type edit (`pettypes-specialties.spec.ts`) | pass | 9.98% | |
| J13 | Pet type delete (`pettypes-specialties.spec.ts`) | pass | 9.98% | |
| J14 | Specialty edit + `/specialties/add` → 404 page (`pettypes-specialties.spec.ts`) | pass | 7.43% | |
| J15 | Wildcard not-found for random URL (`shell.spec.ts`) | pass | 4.01% | |
| J16 | Nav link parity (`shell.spec.ts`) | pass | 6.39% | all 7 links land on the same route + heading |
| J17 | Server `errors`-header message surfacing (`shell.spec.ts`) | pass | 5.64% | Playwright `route` mock, see "Backend note" |
| J18a | Validation — owner (`validation.spec.ts`) | pass | 5.48% | messages from `src/forms/schemas.ts` |
| J18b | Validation — vet (`validation.spec.ts`) | pass | 4.93% | |
| J18c | Validation — pet type (`validation.spec.ts`) | pass | 4.39% | |
| J18d | Validation — pet (`validation.spec.ts`) | pass | 4.02% | |
| J18e | Validation — visit (`validation.spec.ts`) | pass | 9.66% | |

**22/22 journeys pass** on the dev server and on the production Docker image (nginx, `/petclinic/`
on 8080). The remaining pixel diff is the intended restyle (Bootstrap 3 replaced by CSS Modules +
tokens + lucide icons, no Angular logo in the footer) plus native controls vs Angular Material; the
two Phase 3 visual findings are fixed:

| Id | Phase 3 finding | Phase 4 status |
|---|---|---|
| V1 | Navbar dropdown toggles rendered without visible label text; navbar narrower than the viewport | Fixed — `src/components/NavBar.tsx` + `NavBar.module.css` (full-width bar, styled `.dropdown-toggle`, visible menu) |
| V2 | Extra empty band between navbar and heading on Specialties, Pet Types, New Visit | Fixed — pages render inside `src/components/ui/Page.tsx`; `<br />` spacers and nested Bootstrap containers removed |

The Phase 3 dual-target table (Angular 22/22 + React 22/22, 44/44 total) is recorded in
`docs/migration/REFACTOR.md` (step 1 baseline).

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
| Footer shows the Spring/Pivotal logo (Angular logo removed in Phase 4) | | |
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
