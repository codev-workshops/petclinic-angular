import { RouteObject } from "react-router-dom";
import { Placeholder } from "../../components/Placeholder";

const page = (title: string) => async () => ({
  Component: () => <Placeholder title={title} />,
});

export const ownerRoutes: RouteObject[] = [
  { path: "owners", lazy: page("Owners") },
  { path: "owners/add", lazy: page("New Owner") },
  { path: "owners/:id", lazy: page("Owner Information") },
  { path: "owners/:id/edit", lazy: page("Edit Owner") },
  { path: "owners/:id/pets/add", lazy: page("Add Pet") },
];
