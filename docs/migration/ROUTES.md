# Route mapping (Angular → React)

Both apps are served under `/petclinic/`:

- Angular: `<base href="/petclinic">` in `src/index.html`; `ng build --base-href=/petclinic/`.
- React: `vite.config.ts` `base: '/petclinic/'`; `createBrowserRouter(appRoutes, { basename: '/petclinic' })`
  in `src/router.tsx`.

## Angular route table (source: `src/app/app-routing.module.ts` + feature `*-routing.module.ts`)

Module import order in `AppModule`: Owners, Pets, Visits, PetTypes, Vets, Specialties, then
`AppRoutingModule` (so the `**` wildcard is matched last).

| Module | Angular path | Component | Resolvers | React route file | Wave |
|---|---|---|---|---|---|
| App | `` | `WelcomeComponent` | – | `features/parts/routes.tsx` (`index`) | 0 |
| App | `welcome` | `WelcomeComponent` | – | `features/parts/routes.tsx` | 0 |
| App | `**` | `PageNotFoundComponent` | – | `features/parts/routes.tsx` (`notFoundRoute`, `path: '*'`) | 0 |
| Owners | `owners` | `OwnerListComponent` | – | `features/owners/routes.tsx` | owners |
| Owners | `owners/add` | `OwnerAddComponent` | – | `features/owners/routes.tsx` | owners |
| Owners | `owners/:id` | `OwnerDetailComponent` | – | `features/owners/routes.tsx` | owners |
| Owners | `owners/:id/edit` | `OwnerEditComponent` | – | `features/owners/routes.tsx` | owners |
| Owners | `owners/:id/pets/add` | `PetAddComponent` (**cross-module**: pets component under the owners module) | – | `features/owners/routes.tsx` (renders the pets `PetAdd` component) | owners+pets |
| Pets | `pets` | `PetListComponent` | – | `features/pets/routes.tsx` | pets |
| Pets | `pets/add` | `PetAddComponent` | – | `features/pets/routes.tsx` | pets |
| Pets | `pets/:id/edit` | `PetEditComponent` (child route of `pets/:id`) | – | `features/pets/routes.tsx` | pets |
| Pets | `pets/:id/visits/add` | `VisitAddComponent` (**cross-module**, child route of `pets/:id`; Angular path literal is `'visits\/add'`) | – | `features/pets/routes.tsx` (renders the visits `VisitAdd` component) | pets+visits |
| Visits | `visits` | `VisitListComponent` | – | `features/visits/routes.tsx` | visits |
| Visits | `visits/add` | `VisitAddComponent` | – | `features/visits/routes.tsx` | visits |
| Visits | `visits/:id/edit` | `VisitEditComponent` | – | `features/visits/routes.tsx` | visits |
| PetTypes | `pettypes` | `PettypeListComponent` | – | `features/pettypes/routes.tsx` | pettypes |
| PetTypes | `pettypes/add` | `PettypeAddComponent` | – | `features/pettypes/routes.tsx` | pettypes |
| PetTypes | `pettypes/:id/edit` | `PettypeEditComponent` | – | `features/pettypes/routes.tsx` | pettypes |
| Vets | `vets` | `VetListComponent` | – | `features/vets/routes.tsx` | vets |
| Vets | `vets/add` | `VetAddComponent` | – | `features/vets/routes.tsx` | vets |
| Vets | `vets/:id/edit` | `VetEditComponent` | `vet: VetResolver` (`getVetById(:id)`), `specs: SpecResolver` (`getSpecialties()`) | `features/vets/routes.tsx` | vets |
| Specialties | `specialties` | `SpecialtyListComponent` | – | `features/specialties/routes.tsx` | specialties |
| Specialties | `specialties/:id/edit` | `SpecialtyEditComponent` | – | `features/specialties/routes.tsx` | specialties |
| Specialties | ~~`specialties/add`~~ | `SpecialtyAddComponent` | – | **Unrouted in Angular** (commented out in `specialties-routing.module.ts`; the add form is embedded inline in `SpecialtyListComponent`). Do not add a React route unless parity requires it. | specialties |
| Specialties | ~~`specialties/:id`~~ | `SpecialtyDetailComponent` | – | **Unrouted in Angular** (commented out). | – |

Notes:

- `pets/:id` itself has no component in Angular (parent path only); only its children
  `edit` and `visits/add` render.
- The `**` wildcard renders `PageNotFound` *inside* the shared layout (nav bar + footer),
  matching the Angular `<router-outlet>` placement.

## React route tree (`src/router.tsx`)

```tsx
export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,               // NavBar + <Outlet/> + footer (app.component.html)
    children: [
      ...partsRoutes,                  // index + 'welcome' → <Welcome/>
      ...ownersRoutes,                 // features/owners/routes.tsx   (stub: [])
      ...petsRoutes,                   // features/pets/routes.tsx     (stub: [])
      ...visitsRoutes,                 // features/visits/routes.tsx   (stub: [])
      ...pettypesRoutes,               // features/pettypes/routes.tsx (stub: [])
      ...vetsRoutes,                   // features/vets/routes.tsx     (stub: [])
      ...specialtiesRoutes,            // features/specialties/routes.tsx (stub: [])
      notFoundRoute,                   // '*' → <PageNotFound/>
    ],
  },
];
export const router = createBrowserRouter(appRoutes, { basename: '/petclinic' });
```

Each feature wave fills **only** its own `features/<feature>/routes.tsx` (`export const
<feature>Routes: RouteObject[]`) with relative paths (`'owners'`, `'owners/:id/edit'`, …).
React Router ranks by specificity, so ordering between feature arrays does not matter.

### Resolvers

Angular resolvers (`VetResolver`, `SpecResolver`) pre-load data before activation. In React
use TanStack Query inside the page component (`useQuery({ queryKey: queryKeys.vets.detail(id),
queryFn: () => getVetById(id) })`) with `<LoadingIndicator/>` while pending and
`<ErrorAlert/>` on failure. Route-level `loader`s are intentionally *not* used so error and
loading UI stay consistent across pages.

## Nav bar links (`src/components/NavBar.tsx`, from `app.component.html`)

| Label | Target | Type |
|---|---|---|
| brand | `/` | `Link` |
| Home | `/welcome` | `Link` |
| Owners → Search | `/owners` | dropdown `Link` |
| Owners → Add New | `/owners/add` | dropdown `Link` |
| Veterinarians → All | `/vets` | dropdown `Link` |
| Veterinarians → Add New | `/vets/add` | dropdown `Link` |
| Pet Types | `/pettypes` | `NavLink` (active class) |
| Specialties | `/specialties` | `NavLink` (active class) |

Angular has no top-level "Pets" or "Visits" nav item; neither does React.

## Serving / Docker decision

- `npm run build` (Vite) and `npm run ng:build` (Angular) both emit to `dist/` — they are
  alternative builds of the same deployable, never run together into one directory.
- `Dockerfile` now builds the **React** app (`node:22-alpine`, `npm ci && npm run build`)
  and serves `dist/` with nginx on port **8080** under `/petclinic/`
  (`nginx/default.conf`: `location /petclinic/ { try_files $uri $uri/ /petclinic/index.html; }`,
  `/` redirects to `/petclinic/`). The Angular image can still be produced by swapping
  `npm run build` for `npm run ng:build -- --base-href=/petclinic/` in the Dockerfile.
- Dev server: `npm run dev` → `http://localhost:5173/petclinic/`; Angular `npm run ng:start`
  → `http://localhost:4200/` (the Wave 3 parity suite runs both).
