import type { RouteObject } from "react-router-dom";

export const petRoutes: RouteObject[] = [
  { path: "pets", lazy: () => import("./PetListPage") },
  { path: "pets/add", lazy: () => import("./PetAddPage") },
  {
    path: "owners/:id/pets/add",
    lazy: () => import("./PetAddPage"),
  },
  { path: "pets/:id/edit", lazy: () => import("./PetEditPage") },
  { path: "pets/:id/visits/add", lazy: () => import("../visits/VisitAddPage") },
];
