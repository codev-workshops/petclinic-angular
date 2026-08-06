import type { RouteObject } from "react-router-dom";
import { Placeholder } from "../../components/Placeholder";
import { ownerLoader, ownersLoader } from "./loaders";

export const ownerRoutes: RouteObject[] = [
  {
    path: "owners",
    loader: ownersLoader,
    lazy: () => import("./pages/OwnerListPage"),
  },
  {
    path: "owners/add",
    lazy: () => import("./pages/OwnerAddPage"),
  },
  {
    path: "owners/:id",
    loader: ownerLoader,
    lazy: () => import("./pages/OwnerDetailPage"),
  },
  {
    path: "owners/:id/edit",
    loader: ownerLoader,
    lazy: () => import("./pages/OwnerEditPage"),
  },
  {
    path: "owners/:id/pets/add",
    Component: () => <Placeholder title="Add Pet" />,
  },
];
