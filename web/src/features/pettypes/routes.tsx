import { RouteObject } from "react-router-dom";
import { Placeholder } from "../../components/Placeholder";

export const pettypeRoutes: RouteObject[] = [
  {
    path: "pettypes",
    Component: () => <Placeholder title="Pet Types" />,
  },
  {
    path: "pettypes/add",
    Component: () => <Placeholder title="New Pet Type" />,
  },
  {
    path: "pettypes/:id/edit",
    Component: () => <Placeholder title="Edit Pet Type" />,
  },
];
