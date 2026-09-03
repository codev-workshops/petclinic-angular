# Phase 4 — Idiomatic refactor

Branch `migration/phase-4-idiomatic` (PR "Phase 4: Idiomatic refactor"), based on `main` @ `6ad6ff3`
(`react-cutover-20260903`). Every step below is one commit; the Playwright parity suite
(`e2e/`) and `npm run lint && npm run typecheck && npm run test -- --run && npm run build`
were green after each one.

## Step 1 — Baseline

Backend: `springcommunity/spring-petclinic-rest` on `:9966`. Angular `npm run ng:start`
(serves at `http://localhost:4200/` — the dev server has no `/petclinic` base href, so
`ANGULAR_BASE_URL=http://localhost:4200/` was passed) and React `npm run dev`
(`http://localhost:5173/petclinic/`).

```
ANGULAR_BASE_URL=http://localhost:4200/ REACT_BASE_URL=http://localhost:5173/petclinic/ npm run test:e2e:both
44 passed (41.2s)      # 22 angular + 22 react
```

Dependency count before: `package.json` 25 `dependencies` + 49 `devDependencies` = 74 direct.

## Step 2 — Decommission Angular

Deleted `src/app/**`, Angular entry files (`src/main.ts`, `src/index.html`, `src/polyfills.ts`,
`src/test.ts`, `src/environments/**`), `angular.json`, `karma.conf.js`, `protractor.conf.js`,
`e2e-protractor/**`, Angular tsconfigs and `.eslintrc.json`; `tsconfig.react.json` became the only
`tsconfig.json`. All Angular / Material / RxJS / zone.js / moment / core-js / jquery / tether / ngx-*
dependencies and `ng:*` scripts were removed. Playwright is now a single React project
(`REACT_BASE_URL`), `e2e/fixtures.ts` lost the `Target` switch, `test:e2e:angular` / `test:e2e:both`
scripts are gone; `e2e/__screenshots__/angular/**` is kept as the frozen historical reference.
`README.md`, `Dockerfile` and `.github/workflows/react-ci.yml` reference React only.

Dependency count after step 2: 7 + 21 = 28 direct (Bootstrap 3 kept one more step because
`src/main.tsx` still imported its stylesheet).

## Step 3 — Styling: CSS Modules + design tokens + lucide-react

**Decision: CSS Modules + `src/styles/tokens.css`, not Tailwind.** The app is ~20 small screens
with an existing, deliberately preserved PetClinic look (dark navbar, green accents, Varela Round /
Montserrat). CSS Modules were already the colocation convention of the React port, need no extra
build plugin, keep class names readable in DevTools/parity screenshots, and let the few Bootstrap
class names the parity suite queries (`navbar`, `dropdown`, `dropdown-toggle`, `table`,
`table-condensed`, `dl-horizontal`, `help-block`, `alert alert-danger`, `loading-indicator`) stay as
*unstyled semantic hooks* next to the module class. Tailwind would have meant a PostCSS pipeline,
a large utility vocabulary for a tiny surface and re-expressing the theme as config for no gain.

- Removed `bootstrap` (3.3.7) from `package.json`; deleted `src/assets/css/petclinic.css`, the
  glyphicons font files, legacy `.eot`/`.svg` fonts and the Angular logo. `src/styles/global.css`
  keeps only the two brand `@font-face`s and a small reset.
- New primitives in `src/components/ui/`: `Page`, `Button`, `Table`, `Form`, `Field`, `Input`,
  `Select`, `FormActions`; `src/utils/cx.ts` composes module classes with the parity hooks.
- Icons: `lucide-react@0.475.0` replaces every glyphicon (navbar, loading spinner, alert dismiss,
  field valid/invalid feedback). All icons are `aria-hidden`; buttons keep text content.
- Fixed PARITY.md findings: the navbar now spans the viewport and the dropdown labels are visible
  (`NavBar.module.css`, no jQuery/Bootstrap JS); the empty band above the Specialties, Pet Types and
  New Visit headings came from `<br />` spacers and Bootstrap `container` nesting — replaced by `Page`
  with token-driven spacing.
- Selector-only e2e impact: none — no `e2e/**` change was needed for this step.

Dependency count after step 3: 7 + 21 = 28 direct (`-bootstrap`, `+lucide-react`).

## Step 4 — Shared Zod schemas

`zod@3.25.76` added; `src/forms/schemas.ts` is the single validation module. `textField(rules)`
builds a `z.string().superRefine` that reproduces the Angular validator semantics exactly:
`minlength` / `maxlength` / `pattern` pass on an empty value (only `required` fires), several rules
may fail at once, and every failing rule yields its own message in template order. Anchored regexes
(`/^[a-zA-Z]*$/`, `/^[0-9]*$/`, `/^[A-Za-z0-9].{0,29}$/`, `/^[A-Za-z0-9].{0,79}$/`, `/^[A-Za-z]*$/`),
lengths and messages were moved verbatim (including "character long", "may be at least",
"only accept digits" and the vet-add "First name" vs vet-edit "First Name" wording).
`fieldIssues(schema, value)` returns `{ kind, message }[]` so each form keeps its own dirty /
touched / submitted gating unchanged (owner-edit colours pristine fields, vet-add and pettype-add
show `required` after a submit attempt, specialty/pettype edit only when dirty).
Forms: `OwnerForm`, `PetForm`, `VisitForm`, `VetNameField`/`VetForm`, `PetTypeForm`, `SpecialtyForm`
now import from `@/forms/schemas` (still relative paths until step 5); the per-form `validate*`
helpers and error interfaces were deleted. `react-hook-form` was not added: the forms are 1–5
fields with bespoke gating, and a resolver would have hidden the Angular quirks above.

Dependency count after step 4: 8 + 21 = 29 direct (`+zod`).

## Step 5 — `@/` import alias

`@/*` → `src/*` in `tsconfig.json` (`baseUrl` + `paths`), `vite.config.ts` and `vitest.config.ts`
(`resolve.alias`). All 330 cross-folder (`../`) imports in `src/**` were rewritten to `@/…`;
same-folder `./` imports stay relative. Enforced by ESLint `no-restricted-imports` with the pattern
group `../*` for `src/**/*.{ts,tsx}` (CSS `url(../assets/…)` references are unaffected).

## Step 6 — zone.js / moment / core-js verification

```
npm ls zone.js moment core-js jquery bootstrap tether rxjs   →   └── (empty)
grep -rniE "zone\.js|moment|core-js|jquery|tether" src e2e package.json vite.config.ts
```
Only hit: a comment in `e2e/journeys/pets-visits.spec.ts` explaining the historical Angular date
format. No code or dependency left. Runtime `dependencies` (8): `@tanstack/react-query`, `axios`,
`date-fns`, `lucide-react`, `react`, `react-dom`, `react-router-dom`, `zod`.

## Step 7 — Swallow-and-default fallbacks in `src/services/api.ts` (documentation only, no change)

Angular's `HttpErrorHandler.handleError(operation, result)` **swallowed** every HTTP error and
returned `of(result)`. The React port kept the `fallback` argument on every call for traceability but
`createHandleError` (`src/services/errorHandler.ts`) **throws** an `ApiError` carrying
`{ serviceName, operation, status, fallback }`; nothing in `src/` reads `ApiError.fallback`, callers
surface `getErrorMessage()` in the dismissible alert. The 30 declared fallbacks (candidate product
decisions — keep throwing, or restore Angular's silent default for some operations?):

| Service | Operation → Angular fallback |
| --- | --- |
| Owner | `getOwners → []`, `getOwnerById → {}`, `searchOwners → []`, `addOwner → owner`, `updateOwner → owner`, `deleteOwner → [ownerId]` |
| Pet | `getPets → []`, `getPetById → {}`, `addPet → pet`, `updatePet → pet`, `deletePet → 0` |
| Visit | `getVisits → []`, `getVisitById → {}`, `addVisit → visit`, `updateVisit → visit`, `deleteVisit → 0` |
| Vet | `getVets → []`, `getVetById → {}`, `addVet → vet`, `updateVet → vet`, `deleteVet → 0` |
| PetType | `getPetTypes → []`, `getPetTypeById → {}`, `addPetType → petType`, `updatePetType → petType`, `deletePetType → 0` |
| Specialty | `getSpecialties → []`, `getSpecialtyById → {}`, `addSpecialty → specialty`, `updateSpecialty → specialty`, `deleteSpecialty → 0` |

Notable ones: `getXById → {}` would have rendered an empty detail page instead of an error in
Angular; `add*/update* → input` made a failed save look successful. The parity suite asserts the
React behaviour (error alert shown), so this PR does not change it.

## Step 8 — Final verification

- `npm run test:e2e` (dev server) → 22 passed; `npm run test:e2e:visual-diff` regenerated
  `e2e/__screenshots__/react/**`, `diff/**` and `report.md` (Angular reference untouched; range
  3.9 %–13.7 %, all explained by the intended restyle / native controls). `docs/migration/PARITY.md`
  rewritten for the React-only run.
- `docker build -t petclinic-react:phase4 .` → nginx serves `http://localhost:8080/petclinic/`
  (200 for `/petclinic/` and deep link `/petclinic/owners/1`, assets under `/petclinic/assets/`);
  `REACT_BASE_URL=http://localhost:8080/petclinic/ npm run test:e2e` → 22 passed.
- Dependency count: **before 25 + 49 = 74 → after 8 + 21 = 29 direct** (`package.json`).

## Residual tech debt

1. **`ApiError.fallback` is dead data** (step 7): the 30 Angular fallbacks are carried on the error
   but never read. Product decision needed: drop the argument or restore silent defaults per
   operation.
2. **Parity hook class names** (`navbar`, `dropdown`, `dropdown-toggle`, `table`,
   `table-condensed`, `dl-horizontal`, `help-block`, `alert alert-danger`, `loading-indicator`)
   are kept as unstyled semantic hooks for `e2e/**`. Moving the suite to `data-testid` / role
   queries would let them go.
3. **Forms are hand-rolled controlled state**; `react-hook-form` was deliberately not added. If the
   forms grow, `zodResolver` + `useForm` can replace the per-form `useState`/`dirty` bookkeeping
   while keeping `src/forms/schemas.ts`.
4. **Message typos inherited from the Angular templates** ("Name may be at least 1 characters
   long", "Name may be at most 30 character long", "Phone number only accept digits") are kept
   verbatim because the parity suite asserts them.
5. **Legacy navigation and layout compromises**: `vetEditLoader` pre-fetches via the router loader
   (Angular resolver parity) while every other page fetches in-component; the vet specialties picker
   is a native `<select multiple>`.
6. **No CSS linting** (stylelint) for the new CSS Modules; tokens are plain custom properties with
   no type-level check.
7. **`e2e/__screenshots__/angular/**`** remains only as a historical reference and will drift from
   the React screenshots on every restyle; delete it once the Angular comparison is no longer
   needed.

## Per-step parity log

| Step | Commit | e2e | lint / typecheck / vitest / build |
| ---- | ------ | --- | --------------------------------- |
| 1 Baseline | `2fe325a` | 44/44 (angular + react) | green |
| 2 Decommission Angular | `2e13f65` | 22/22 (react) | green (vitest 166) |
| 3 CSS Modules + tokens + lucide | `1e7c298` | 22/22 (react) | green (vitest 166) |
| 4 Zod schemas | `56d7ff2` | 22/22 (react) | green (vitest 169) |
| 5 `@/` alias + ESLint rule | `d83dc1e` | 22/22 (react) | green (vitest 169) |
| 6+7 legacy dep verification, api.ts fallback inventory | `edb3377` | (no code change) | — |
| 8 screenshots, PARITY.md, Docker | — | 22/22 dev + 22/22 Docker image | green (vitest 169) |
