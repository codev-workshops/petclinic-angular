import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import Layout from './components/Layout';
import { partsRoutes, notFoundRoute } from './features/parts/routes';
import { specialtiesRoutes } from './features/specialties/routes';
import { pettypesRoutes } from './features/pettypes/routes';
import { vetsRoutes } from './features/vets/routes';
import { ownersRoutes } from './features/owners/routes';
import { petsRoutes } from './features/pets/routes';
import { visitsRoutes } from './features/visits/routes';

/** Same base path as `<base href="/petclinic">` in the Angular app. */
export const ROUTER_BASENAME = '/petclinic';

/**
 * Route tree in the same order as the Angular module imports
 * (AppModule: Owners, Pets, Visits, PetTypes, Vets, Specialties, then AppRoutingModule
 * whose `**` wildcard must stay last). React Router ranks routes by specificity, so the
 * order only matters for documentation parity.
 */
export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      ...partsRoutes,
      ...ownersRoutes,
      ...petsRoutes,
      ...visitsRoutes,
      ...pettypesRoutes,
      ...vetsRoutes,
      ...specialtiesRoutes,
      notFoundRoute,
    ],
  },
];

export const router = createBrowserRouter(appRoutes, { basename: ROUTER_BASENAME });
