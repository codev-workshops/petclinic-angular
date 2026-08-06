import { RouteObject } from "react-router-dom";
import { Placeholder } from "../../components/Placeholder";

export const petRoutes: RouteObject[] = [
  {
    path: "pets",
    lazy: async () => ({ Component: () => <Placeholder title="Pets" /> }),
  },
  {
    path: "pets/add",
    lazy: async () => ({ Component: () => <Placeholder title="Add Pet" /> }),
  },
  {
    path: "pets/:id/edit",
    lazy: async () => ({ Component: () => <Placeholder title="Pet" /> }),
  },
  {
    path: "pets/:id/visits/add",
    lazy: async () => ({ Component: () => <Placeholder title="New Visit" /> }),
  },
];
