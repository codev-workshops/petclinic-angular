import type { RouteObject } from "react-router-dom";

export const specialtyRoutes: RouteObject[] = [
  { path: "specialties", lazy: () => import("./SpecialtyListPage") },
  { path: "specialties/:id/edit", lazy: () => import("./SpecialtyEditPage") },
];
