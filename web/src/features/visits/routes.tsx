import type { RouteObject } from "react-router-dom";

export const visitRoutes: RouteObject[] = [
  { path: "visits", lazy: () => import("./VisitListPage") },
  { path: "visits/add", lazy: () => import("./VisitAddPage") },
  { path: "visits/:id/edit", lazy: () => import("./VisitEditPage") },
];
