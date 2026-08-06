import { RouteObject } from "react-router-dom";
import { Placeholder } from "../../components/Placeholder";

export const vetRoutes: RouteObject[] = [
  { path: "vets", Component: () => <Placeholder title="Veterinarians" /> },
  {
    path: "vets/add",
    Component: () => <Placeholder title="New Veterinarian" />,
  },
  {
    path: "vets/:id/edit",
    Component: () => <Placeholder title="Edit Veterinarian" />,
  },
];
