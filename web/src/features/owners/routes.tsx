import { RouteObject } from "react-router-dom";
import { Placeholder } from "../../components/Placeholder";

const page = (title: string) => () => <Placeholder title={title} />;

export const ownerRoutes: RouteObject[] = [
  { path: "owners", Component: page("Owners") },
  { path: "owners/add", Component: page("New Owner") },
  { path: "owners/:id", Component: page("Owner Information") },
  { path: "owners/:id/edit", Component: page("Edit Owner") },
  { path: "owners/:id/pets/add", Component: page("Add Pet") },
];
