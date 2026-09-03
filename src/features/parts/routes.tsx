import type { RouteObject } from 'react-router-dom';
import Welcome from './Welcome';
import PageNotFound from './PageNotFound';

/**
 * Mirrors src/app/app-routing.module.ts:
 *   {path: 'welcome'} and {path: ''} -> WelcomeComponent, {path: '**'} -> PageNotFoundComponent
 */
export const partsRoutes: RouteObject[] = [
  { index: true, element: <Welcome /> },
  { path: 'welcome', element: <Welcome /> },
];

export const notFoundRoute: RouteObject = { path: '*', element: <PageNotFound /> };
