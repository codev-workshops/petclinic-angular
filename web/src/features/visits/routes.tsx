import { RouteObject } from "react-router-dom";
import { Placeholder } from "../../components/Placeholder";

export const visitRoutes: RouteObject[] = [
  {
    path: "visits",
    lazy: async () => ({ Component: () => <Placeholder title="Visits" /> }),
  },
  {
    path: "visits/add",
    lazy: async () => ({ Component: () => <Placeholder title="New Visit" /> }),
  },
];
