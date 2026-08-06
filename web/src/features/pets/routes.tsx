import { RouteObject } from "react-router-dom";
import { Placeholder } from "../../components/Placeholder";

export const petRoutes: RouteObject[] = [
  { path: "pets", Component: () => <Placeholder title="Pets" /> },
  { path: "pets/add", Component: () => <Placeholder title="Add Pet" /> },
  { path: "pets/:id/edit", Component: () => <Placeholder title="Pet" /> },
  {
    path: "pets/:id/visits/add",
    Component: () => <Placeholder title="New Visit" />,
  },
];
