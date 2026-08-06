import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { deletePet, deleteVisit, getOwnerById } from "../../../api";
import type { Owner } from "../../../api/types";
import { ownerDetailLoader } from "../loaders";
import { Component } from "./OwnerDetailPage";

vi.mock("../../../api", () => ({
  deletePet: vi.fn(),
  deleteVisit: vi.fn(),
  getOwnerById: vi.fn(),
}));

const owner = {
  id: 1,
  firstName: "John",
  lastName: "Doe",
  address: "1 Main Street",
  city: "Springfield",
  telephone: "1234567890",
  pets: [],
} as Owner;

function Location() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

function renderDetail() {
  const router = createMemoryRouter(
    [
      {
        path: "/owners/:id",
        loader: ownerDetailLoader,
        element: <Component />,
      },
      { path: "/owners", element: <Location /> },
      { path: "/owners/:id/edit", element: <Location /> },
      { path: "/owners/:id/pets/add", element: <Location /> },
    ],
    { initialEntries: ["/owners/1"] },
  );
  return render(<RouterProvider router={router} />);
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("OwnerDetailPage", () => {
  it("renders owner information and pets heading", async () => {
    vi.mocked(getOwnerById).mockResolvedValue(owner);
    renderDetail();
    expect(await screen.findByText("John Doe")).toBeVisible();
    expect(screen.getAllByRole("heading")).toHaveLength(2);
    expect(
      screen.getByRole("heading", { name: "Pets and Visits" }),
    ).toBeVisible();
  });

  it("navigates from each owner control", async () => {
    vi.mocked(getOwnerById).mockResolvedValue(owner);
    renderDetail();
    await screen.findByText("John Doe");
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(await screen.findByTestId("location")).toHaveTextContent("/owners");
  });
});
