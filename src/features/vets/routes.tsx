import type { RouteObject } from 'react-router-dom';
import VetListPage from './pages/VetListPage';
import VetAddPage from './pages/VetAddPage';
import VetEditPage from './pages/VetEditPage';
import { vetEditLoader } from './pages/vetEditLoader';

/**
 * Mirrors src/app/vets/vets-routing.module.ts:
 *   vets -> VetListComponent, vets/add -> VetAddComponent,
 *   vets/:id/edit -> VetEditComponent with resolve {vet: VetResolver, specs: SpecResolver}
 *   (ported as a route loader).
 */
export const vetsRoutes: RouteObject[] = [
  { path: 'vets', element: <VetListPage /> },
  { path: 'vets/add', element: <VetAddPage /> },
  { path: 'vets/:id/edit', element: <VetEditPage />, loader: vetEditLoader },
];
