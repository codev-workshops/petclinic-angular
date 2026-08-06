import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { getOwners, searchOwners } from "../../../api";
import type { Owner } from "../../../api/types";
import { ownersLoader } from "../loaders";
import { Component } from "./OwnerListPage";

vi.mock("../../../api", () => ({
  getOwners: vi.fn(),
  searchOwners: vi.fn(),
}));

const owners = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    address: "1 Main Street",
    city: "Springfield",
    telephone: "1234567890",
    pets: [{ id: 1, name: "Leo" }],
  },
] as Owner[];

function renderList() {
  const router = createMemoryRouter(
    [{ path: "/owners", loader: ownersLoader, element: <Component /> }],
    { initialEntries: ["/owners"] },
  );
  return render(<RouterProvider router={router} />);
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("OwnerListPage", () => {
  it("renders the legacy owner table and search form", async () => {
    vi.mocked(getOwners).mockResolvedValue(owners);
    renderList();
    expect(
      await screen.findByRole("heading", { name: "Owners" }),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "John Doe" })).toBeVisible();
    expect(document.querySelector("#ownersTable")).toBeInTheDocument();
    expect(document.querySelector("#search-owner-form")).toBeInTheDocument();
    expect(screen.getByText("Leo")).toBeVisible();
  });

  it("selects getOwners for empty searches and searchOwners otherwise", async () => {
    vi.mocked(getOwners).mockResolvedValue(owners);
    vi.mocked(searchOwners).mockResolvedValue(owners);
    renderList();
    await screen.findByRole("link", { name: "John Doe" });
    const input = screen.getByRole("textbox", { name: "" });
    fireEvent.change(input, { target: { value: "Smi" } });
    fireEvent.submit(screen.getByRole("button", { name: "Find Owner" }));
    await waitFor(() => expect(searchOwners).toHaveBeenCalledWith("Smi"));
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.submit(screen.getByRole("button", { name: "Find Owner" }));
    await waitFor(() => expect(getOwners).toHaveBeenCalledTimes(2));
  });

  it("shows the no-match message when a search fails", async () => {
    vi.mocked(getOwners).mockResolvedValue(owners);
    vi.mocked(searchOwners).mockRejectedValue("not found");
    renderList();
    await screen.findByRole("link", { name: "John Doe" });
    const input = screen.getByRole("textbox", { name: "" });
    fireEvent.change(input, { target: { value: "Nobody" } });
    fireEvent.submit(screen.getByRole("button", { name: "Find Owner" }));
    expect(
      await screen.findByText('No owners with LastName starting with "Nobody"'),
    ).toBeVisible();
    expect(document.querySelector("#ownersTable")).not.toBeInTheDocument();
  });
});
