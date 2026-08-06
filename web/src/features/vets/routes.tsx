import { RouteObject } from "react-router-dom";
import { Placeholder } from "../../components/Placeholder";

export const vetRoutes: RouteObject[] = [
  {
    path: "vets",
    lazy: async () => ({
      Component: () => <Placeholder title="Veterinarians" />,
    }),
  },
  {
    path: "vets/add",
    lazy: async () => ({
      Component: () => <Placeholder title="New Veterinarian" />,
    }),
  },
  {
    path: "vets/:id/edit",
    lazy: async () => ({
      Component: () => <Placeholder title="Edit Veterinarian" />,
    }),
  },
];
