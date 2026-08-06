import { RouteObject } from "react-router-dom";
import { Placeholder } from "../../components/Placeholder";

export const visitRoutes: RouteObject[] = [
  { path: "visits", Component: () => <Placeholder title="Visits" /> },
  { path: "visits/add", Component: () => <Placeholder title="New Visit" /> },
  {
    path: "visits/:id/edit",
    Component: () => <Placeholder title="Edit Visit" />,
  },
];
