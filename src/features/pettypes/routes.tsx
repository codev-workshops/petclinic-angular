import type { RouteObject } from 'react-router-dom';
import PetTypeListPage from './pages/PetTypeListPage';
import PetTypeAddPage from './pages/PetTypeAddPage';
import PetTypeEditPage from './pages/PetTypeEditPage';

/**
 * Mirrors src/app/pettypes/pettypes-routing.module.ts:
 *   pettypes -> PettypeListComponent, pettypes/add -> PettypeAddComponent,
 *   pettypes/:id/edit -> PettypeEditComponent
 */
export const pettypesRoutes: RouteObject[] = [
  { path: 'pettypes', element: <PetTypeListPage /> },
  { path: 'pettypes/add', element: <PetTypeAddPage /> },
  { path: 'pettypes/:id/edit', element: <PetTypeEditPage /> },
];
