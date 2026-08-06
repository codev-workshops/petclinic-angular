import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { getOwnerById, updateOwner } from "../../../api";
import type { Owner } from "../../../api/types";
import { ownerLoader } from "../loaders";
import { Component } from "./OwnerEditPage";

vi.mock("../../../api", () => ({
  getOwnerById: vi.fn(),
  updateOwner: vi.fn(),
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

function renderEdit() {
  const router = createMemoryRouter(
    [
      {
        path: "/owners/:id/edit",
        loader: ownerLoader,
        element: <Component />,
      },
      { path: "/owners/:id", element: <Location /> },
    ],
    { initialEntries: ["/owners/1/edit"] },
  );
  return render(<RouterProvider router={router} />);
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("OwnerEditPage", () => {
  it("populates values and renders server errors", async () => {
    vi.mocked(getOwnerById).mockResolvedValue(owner);
    vi.mocked(updateOwner).mockRejectedValue("Owner update failed");
    renderEdit();
    expect(await screen.findByDisplayValue("John")).toBeVisible();
    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Johnny" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update Owner" }));
    expect(await screen.findByText("Owner update failed")).toBeVisible();
    expect(document.querySelector("div.alert.alert-danger")).toHaveTextContent(
      "Owner update failed",
    );
  });

  it("updates with the loaded owner and navigates to detail", async () => {
    vi.mocked(getOwnerById).mockResolvedValue(owner);
    vi.mocked(updateOwner).mockResolvedValue(owner);
    renderEdit();
    await screen.findByDisplayValue("John");
    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Johnny" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update Owner" }));
    await waitFor(() => expect(updateOwner).toHaveBeenCalled());
    expect(updateOwner).toHaveBeenCalledWith(
      "1",
      expect.objectContaining({
        id: 1,
        firstName: "Johnny",
        lastName: "Doe",
        address: "1 Main Street",
        city: "Springfield",
        telephone: "1234567890",
      }),
    );
    expect(await screen.findByTestId("location")).toHaveTextContent(
      "/owners/1",
    );
  });
});
