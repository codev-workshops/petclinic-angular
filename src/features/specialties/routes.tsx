import type { RouteObject } from 'react-router-dom';
import SpecialtyListPage from './pages/SpecialtyListPage';
import SpecialtyEditPage from './pages/SpecialtyEditPage';

/**
 * Mirrors src/app/specialties/specialties-routing.module.ts:
 *   'specialties' -> SpecialtyListComponent, 'specialties/:id/edit' -> SpecialtyEditComponent.
 * `specialties/add` is commented out in Angular (the add form is rendered inline on the list page).
 */
export const specialtiesRoutes: RouteObject[] = [
  { path: 'specialties', element: <SpecialtyListPage /> },
  { path: 'specialties/:id/edit', element: <SpecialtyEditPage /> },
];
