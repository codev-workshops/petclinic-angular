import { RouteObject } from "react-router-dom";
import { Placeholder } from "../../components/Placeholder";

export const specialtyRoutes: RouteObject[] = [
  {
    path: "specialties",
    Component: () => <Placeholder title="Specialties" />,
  },
  {
    path: "specialties/:id/edit",
    Component: () => <Placeholder title="Edit Specialty" />,
  },
];
