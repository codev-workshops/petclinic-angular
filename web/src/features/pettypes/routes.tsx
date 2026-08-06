import { RouteObject } from "react-router-dom";
import { Placeholder } from "../../components/Placeholder";

export const pettypeRoutes: RouteObject[] = [
  {
    path: "pettypes",
    lazy: async () => ({ Component: () => <Placeholder title="Pet Types" /> }),
  },
  {
    path: "pettypes/add",
    lazy: async () => ({
      Component: () => <Placeholder title="New Pet Type" />,
    }),
  },
  {
    path: "pettypes/:id/edit",
    lazy: async () => ({
      Component: () => <Placeholder title="Edit Pet Type" />,
    }),
  },
];
