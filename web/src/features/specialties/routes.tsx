import { RouteObject } from "react-router-dom";
import { Placeholder } from "../../components/Placeholder";

export const specialtyRoutes: RouteObject[] = [
  {
    path: "specialties",
    lazy: async () => ({
      Component: () => <Placeholder title="Specialties" />,
    }),
  },
  {
    path: "specialties/:id/edit",
    lazy: async () => ({
      Component: () => <Placeholder title="Edit Specialty" />,
    }),
  },
];
