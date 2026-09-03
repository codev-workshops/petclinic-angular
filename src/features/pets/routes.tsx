import type { RouteObject } from 'react-router-dom';
import VisitAddPage from '../visits/pages/VisitAddPage';
import PetAddPage from './pages/PetAddPage';
import PetEditPage from './pages/PetEditPage';
import PetListPage from './pages/PetListPage';

/** Port of src/app/pets/pets-routing.module.ts (see docs/migration/ROUTES.md). */
export const petsRoutes: RouteObject[] = [
  { path: 'pets', element: <PetListPage /> },
  { path: 'pets/add', element: <PetAddPage /> },
  { path: 'pets/:id/edit', element: <PetEditPage /> },
  { path: 'pets/:id/visits/add', element: <VisitAddPage /> },
];
