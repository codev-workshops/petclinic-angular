import type { RouteObject } from "react-router-dom";
import { Placeholder } from "../../components/Placeholder";
import { ownerDetailLoader, ownerEditLoader, ownersLoader } from "./loaders";

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
    loader: ownerDetailLoader,
    lazy: () => import("./pages/OwnerDetailPage"),
  },
  {
    path: "owners/:id/edit",
    loader: ownerEditLoader,
    lazy: () => import("./pages/OwnerEditPage"),
  },
  {
    path: "owners/:id/pets/add",
    Component: () => <Placeholder title="Add Pet" />,
  },
];
