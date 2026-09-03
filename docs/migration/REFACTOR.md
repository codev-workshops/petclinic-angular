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

## Per-step parity log

| Step | Commit | e2e | lint / typecheck / vitest / build |
| ---- | ------ | --- | --------------------------------- |
| 1 Baseline | `2fe325a` | 44/44 (angular + react) | green |
| 2 Decommission Angular | `2e13f65` | 22/22 (react) | green (vitest 166) |
| 3 CSS Modules + tokens + lucide | `1e7c298` | 22/22 (react) | green (vitest 166) |
| 4 Zod schemas | `56d7ff2` | 22/22 (react) | green (vitest 169) |
| 5 `@/` alias + ESLint rule | — | 22/22 (react) | green (vitest 169) |
