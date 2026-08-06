# PetClinic Angular→React migration

## Status / phase plan

- Phase 0: React/Vite scaffold, shared API/layout/router foundations.
- Wave 2: shared UI and form primitives, including validation groups, date input,
  `PetList`, and `VisitList`.
- Wave 3: owners ‖ pets+visits ‖ vets+specialties+pettypes.
- Wave 4: cutover.

# PetClinic Angular→React migration — invariants (authoritative)

Derived from the untouched Angular 16 sources on `main`. Every child phase must preserve these.

## Serving contract
- App is served under base path **`/petclinic/`** (legacy `<base href="/petclinic">`).
  Vite `base: '/petclinic/'`, React Router `basename: '/petclinic'`, dev server on port **4200**.
- The frozen Playwright suite navigates to `http://localhost:4200/petclinic/...`.

## HTTP contract
- API base: `http://localhost:9966/petclinic/api/` (env-configurable, same default).
- All calls go through ONE axios client module. No component calls axios directly.
- Endpoints (exact paths, no trailing slashes):
  - owners: `GET owners`, `GET owners?lastName=X`, `GET owners/{id}`, `POST owners`,
    `PUT owners/{id}`, `DELETE owners/{id}`
  - pets: `GET pets`, `GET pets/{id}`, `POST owners/{ownerId}/pets`, `PUT pets/{id}`,
    `DELETE pets/{id}`
  - pettypes: `GET pettypes`, `GET pettypes/{id}`, `POST pettypes`, `PUT pettypes/{id}`,
    `DELETE pettypes/{id}`
  - specialties: `GET specialties`, `GET specialties/{id}`, `POST specialties`,
    `PUT specialties/{id}`, `DELETE specialties/{id}`
  - vets: `GET vets`, `GET vets/{id}`, `POST vets`, `PUT vets/{id}`, `DELETE vets/{id}`
  - visits: `GET visits`, `GET visits/{id}`,
    `POST owners/{ownerId}/pets/{petId}/visits`, `PUT visits/{id}`, `DELETE visits/{id}`
- No auth header, no interceptors, no token handling in the legacy app. Do not add any.

## Error contract (legacy `ErrorService` / `HttpErrorHandler`)
Message resolution, in order:
1. If the response carries an `errors` header, JSON-parse it; if it is a non-empty array whose
   first element has `errorMessage`, the message is that string.
2. Otherwise the message is: ``server returned code {status} with body "{body}"``
   (browser/network errors use the underlying error message instead).
Side effects: `console.error(error)` then `console.error(`${serviceName}::${operation} failed: ${message}`)`,
then the operation rejects with the message string.
Each service call has a *fallback result* used only to type the failure path; components set
`errorMessage` from the rejection. Only **owner-edit** renders it, in `div.alert.alert-danger`.

## Data models
```
Owner   { id, firstName, lastName, address, city, telephone, pets: Pet[] }
Pet     { id, ownerId, name, birthDate: 'YYYY-MM-DD', type: PetType, owner: Owner, visits: Visit[] }
PetType { id, name }
Specialty { id, name }
Vet     { id, firstName, lastName, specialties: Specialty[] }
Visit   { id, date: 'YYYY-MM-DD', description, pet: Pet, petId? }
```
Dates are always submitted to the API as `YYYY-MM-DD` (legacy used `moment(x).format('YYYY-MM-DD')`).

## Routes (exact)
```
/                       Welcome
/welcome                Welcome
/owners                 OwnerList
/owners/add             OwnerAdd
/owners/:id             OwnerDetail
/owners/:id/edit        OwnerEdit
/owners/:id/pets/add    PetAdd
/pets                   PetList
/pets/add               PetAdd
/pets/:id/edit          PetEdit
/pets/:id/visits/add    VisitAdd
/pettypes               PettypeList
/pettypes/add           PettypeAdd
/pettypes/:id/edit      PettypeEdit
/specialties            SpecialtyList
/specialties/:id/edit   SpecialtyEdit
/vets                   VetList
/vets/add               VetAdd
/vets/:id/edit          VetEdit
*                       PageNotFound
```
Commented-out `specialties/add` and `specialties/:id` routes are inactive — do not add them.

## Navigation-after-action contract
- owner add → `/owners` (the list, NOT the detail); owner edit → `/owners/{id}`
- pet add/edit → `/owners/{ownerId}`
- visit add/edit → `/owners/{ownerId}`
- vet add/edit → `/vets`
- pettype/specialty edit → back to their list
- list `Home` buttons → `/welcome`

## DOM contract (Bootstrap 3, must be byte-identical in effect)
- Layout wrapper on every page: `div.container-fluid > div.container.xd-container`.
- Navbar: `nav.navbar.navbar-default` with `ul.nav.navbar-nav`; Owners and Veterinarians are
  `li.dropdown` with `ul.dropdown-menu`; glyphicon spans preserved.
- Forms are `form.form-horizontal`; groups are `div.form-group.has-feedback` toggling
  `has-success` / `has-error`; inputs keep their `id` AND `name`; feedback icon is
  `span.glyphicon.form-control-feedback` toggling `glyphicon-ok` / `glyphicon-remove`;
  validation messages are `span.help-block` with the **exact legacy text**.
- Validation messages appear only once the field is *dirty* (touched+changed), matching Angular's
  `field.dirty && field.hasError(...)` — except vet-add and pettype-add `required`, which also show
  after submit. Submit buttons are `disabled` while the form is invalid.
- Ids/classes the suite selects on: `#search-owner-form`, `#lastNameGroup`, `#ownersTable`,
  `#pettypes`, `#specialties`, `#vets`, `#owner_name`, `#type`, `#type1`, `#name`, `#description`,
  `#firstName`, `#lastName`, `#address`, `#city`, `#telephone`, `.ownerFullName`, `.help-block`,
  `.alert.alert-danger`.
- `<select>` options must render the same visible labels (specs select by label).
- Welcome: `h1.title` "Welcome to Petclinic", `h2` "Welcome". 404: `h1` "Oops! Page not found !",
  `h2` "Not Found - 404 error". Footer: angular.png + spring-pivotal-logo.png images.

## Widget replacements
- Angular Material is dropped. **Do not add MUI.** The two Material widgets:
  - `mat-datepicker` inputs (`input[name="birthDate"]`, `input[name="date"]`) → plain text inputs
    accepting the same typed format and producing `YYYY-MM-DD` on submit.
  - `vet-edit`'s `mat-select multiple` for specialties → a native `<select multiple id="spec"
    name="specialties">`; the frozen suite does not assert its internals, but the PUT payload must
    preserve the vet's existing specialties.
- Bootstrap 3 CSS stays as-is; keep `jquery`/`tether`/`bootstrap.js` only if a behavior depends on
  them (the navbar dropdowns do).

## Data-fetch timing
Legacy `vets/:id/edit` used route resolvers (`VetResolver`, `SpecResolver`) — data is present before
the component renders. Reproduce with React Router **data-router `loader`s** for every route that
fetches, not in-component `useEffect` fetching, so no flicker is introduced. Use route-level `lazy`
for code splitting, never bare `React.lazy`.

## Frozen gate
`e2e/playwright/` is byte-immutable. `git diff main -- e2e/` must be empty on every migration
branch. Never edit, skip or weaken a spec.
