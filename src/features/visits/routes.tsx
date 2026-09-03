import type { RouteObject } from 'react-router-dom';
import VisitAddPage from './pages/VisitAddPage';
import VisitEditPage from './pages/VisitEditPage';
import VisitListPage from './pages/VisitListPage';

/** Port of src/app/visits/visits-routing.module.ts (see docs/migration/ROUTES.md). */
export const visitsRoutes: RouteObject[] = [
  { path: 'visits', element: <VisitListPage /> },
  { path: 'visits/add', element: <VisitAddPage /> },
  { path: 'visits/:id/edit', element: <VisitEditPage /> },
];
