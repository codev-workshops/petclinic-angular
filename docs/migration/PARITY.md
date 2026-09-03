# Parity checklist (Wave 3 skeleton)

Wave 3 runs a Playwright suite against the Angular app (`npm run ng:start`, port 4200) and
the React app (`npm run dev`, port 5173), both under `/petclinic/`, against the same
spring-petclinic-rest backend (`http://localhost:9966/petclinic/api/`). Fill in one row per
behaviour; tick both columns only when the two apps behave identically.

## Global

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
