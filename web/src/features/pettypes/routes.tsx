import type { RouteObject } from "react-router-dom";

export const pettypeRoutes: RouteObject[] = [
  { path: "pettypes", lazy: () => import("./PettypeListPage") },
  { path: "pettypes/add", lazy: () => import("./PettypeAddPage") },
  { path: "pettypes/:id/edit", lazy: () => import("./PettypeEditPage") },
];
