import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { PageNotFound } from "./pages/PageNotFound";
import { Welcome } from "./pages/Welcome";
import { ownerRoutes } from "./features/owners/routes";
import { petRoutes } from "./features/pets/routes";
import { visitRoutes } from "./features/visits/routes";
import { vetRoutes } from "./features/vets/routes";
import { specialtyRoutes } from "./features/specialties/routes";
import { pettypeRoutes } from "./features/pettypes/routes";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, lazy: async () => ({ Component: Welcome }) },
        { path: "welcome", lazy: async () => ({ Component: Welcome }) },
        ...ownerRoutes,
        ...petRoutes,
        ...visitRoutes,
        ...vetRoutes,
        ...specialtyRoutes,
        ...pettypeRoutes,
        { path: "*", Component: PageNotFound },
      ],
    },
  ],
  { basename: "/petclinic" },
);
