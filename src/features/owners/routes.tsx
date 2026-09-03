import type { RouteObject } from 'react-router-dom';
import PetAddPage from '@/features/pets/pages/PetAddPage';
import OwnerAddPage from './pages/OwnerAddPage';
import OwnerDetailPage from './pages/OwnerDetailPage';
import OwnerEditPage from './pages/OwnerEditPage';
import OwnerListPage from './pages/OwnerListPage';

/** Port of src/app/owners/owners-routing.module.ts (see docs/migration/ROUTES.md). */
export const ownersRoutes: RouteObject[] = [
  { path: 'owners', element: <OwnerListPage /> },
  { path: 'owners/add', element: <OwnerAddPage /> },
  { path: 'owners/:id', element: <OwnerDetailPage /> },
  { path: 'owners/:id/edit', element: <OwnerEditPage /> },
  { path: 'owners/:id/pets/add', element: <PetAddPage /> },
];
