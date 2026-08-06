import type { RouteObject } from "react-router-dom";

export const vetRoutes: RouteObject[] = [
  { path: "vets", lazy: () => import("./VetListPage") },
  { path: "vets/add", lazy: () => import("./VetAddPage") },
  { path: "vets/:id/edit", lazy: () => import("./VetEditPage") },
];
