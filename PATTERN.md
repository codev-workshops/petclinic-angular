# React migration patterns

React code belongs under `web/`; keep the shared API client, Bootstrap 3 DOM
contract, and route loaders as the stable seams between feature waves.

The complete legacy asset tree is copied into `web/assets`, and React imports
assets from that directory.

The repository remains one npm project with one lockfile. Vite serves `web/` at
`/petclinic/` on port 4200, and the data router uses basename `/petclinic`.
Use Vite + React + TypeScript, React Router data-router route-level `lazy`,
React Hook Form, and axios behind the one client module. Add Zustand only when
real cross-route state requires it. Do not add a component library or MUI;
Bootstrap 3 remains the styling contract.

## Cookbook

- Angular template-driven forms (`ngModel` and `#ref="ngModel"`) become React Hook
  Form while preserving every input's `id` and `name`.
- Keep the exact `.help-block` messages and show them only after the field is
  dirty, except where the invariant explicitly says submit also reveals
  required errors.
- A form-group wrapper owns `has-error`/`has-success` and the
  `glyphicon-ok`/`glyphicon-remove` feedback span.
- A service method becomes an async function over `web/src/api/client.ts`; no
  component calls axios directly.
- An Angular resolver becomes a React Router data-router `loader`; do not fetch
  route data in `useEffect`.
- `@Output` becomes a callback prop.
- `*ngIf` becomes conditional JSX and `*ngFor` becomes `map`.
- Content projection becomes `children`.
- Use `Component` for eagerly imported route components. Use route-level
  `lazy: () => import('./SomePage')` for real feature code splitting; do not add
  no-op lazy wrappers around static imports, and never use bare `React.lazy` for
  route components.
- Preserve `type="button"` on non-submit buttons inside forms, such as the
  legacy `< Back` controls in pet-add and vet-add. A bare React button submits
  its containing form.
- Angular Material's `indigo-pink` theme CSS is intentionally not carried over.
  Material widgets are replaced by the plain Bootstrap-compatible controls
  specified in `MIGRATION.md`.
- `Form` props: `methods`, `onSubmit`, and form attributes; `FormGroup` props:
  `name`, `label`, `rules`, `messages`, `feedback`, `requiredOnSubmit`,
  `labelFor`, column classes, and `children`.
- `FormField` props: `FormGroup` props plus `name`, `id`, `type`, HTML input
  attributes, and `rules`; `SelectField` props: `FormGroup` props plus `name`,
  `options`, option label/value callbacks, `multiple`, and select attributes.
- `DateField` props: `FormGroup` props plus `name`, `id`, and input attributes;
  `SubmitButton` props: button attributes and `children`; `ErrorAlert` props:
  `message`; `PageContainer` props: optional `title` and `children`.
- `PetList` props: `pet`, `onEditPet`, `onAddVisit`, `onDeletePet`,
  `onEditVisit`, `onDeleteVisit`, and optional `onError`; `VisitList` props:
  `visits`, `onEditVisit`, `onDeleteVisit`, and optional `onError`.
- Use `feedback: "immediate"` for owner-edit and `"dirty"` elsewhere. DateField
  stores ISO dates, SelectField stores option objects, and list delete/navigation
  behavior is supplied through callback props.
- Import endpoint functions from `web/src/api/` service modules rather than
  creating feature-local axios calls or request wrappers.

## Before / after

The Phase 0 navbar preserves the Angular dropdown DOM while replacing
`routerLink` with React Router `Link` and replacing Bootstrap's jQuery toggle
with local React state:

```html
<li class="dropdown">
  <a class="dropdown-toggle" data-toggle="dropdown" role="button">
    <span class="glyphicon glyphicon-user"></span> Owners
  </a>
  <ul class="dropdown-menu">
    <li><a routerLink="/owners">Search</a></li>
  </ul>
</li>
```

```tsx
<li className={`dropdown${open === 'owners' ? ' open' : ''}`}>
  <a
    className="dropdown-toggle"
    role="button"
    aria-expanded={open === 'owners'}
    onClick={() => toggle('owners')}
  >
    <span className="glyphicon glyphicon-user" aria-hidden="true" /> Owners
  </a>
  <ul className="dropdown-menu">
    <li><Link to="/owners">Search</Link></li>
  </ul>
</li>
```
