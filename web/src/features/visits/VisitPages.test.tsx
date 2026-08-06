import { cleanup, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Component as VisitAdd, loader as addLoader } from "./VisitAddPage";
import { Component as VisitEdit, loader as editLoader } from "./VisitEditPage";
import { Component as VisitList } from "./VisitListPage";
import { getOwnerById } from "../../api/owners";
import { getPetById } from "../../api/pets";
import { getVisitById } from "../../api/visits";

vi.mock("../../api/owners", () => ({ getOwnerById: vi.fn() }));
vi.mock("../../api/pets", () => ({ getPetById: vi.fn() }));
vi.mock("../../api/visits", () => ({
  addVisit: vi.fn(() => Promise.resolve({})),
  deleteVisit: vi.fn(() => Promise.resolve()),
  getVisitById: vi.fn(),
  updateVisit: vi.fn(() => Promise.resolve({})),
}));
afterEach(cleanup);

const owner = {
  id: 1,
  firstName: "George",
  lastName: "Franklin",
  address: "",
  city: "",
  telephone: "",
  pets: [],
};
const pet = {
  id: 1,
  ownerId: 1,
  name: "Leo",
  birthDate: "2010-01-02",
  type: { id: 1, name: "dog" },
  owner,
  visits: [],
};
const visit = {
  id: 1,
  petId: 1,
  pet,
  date: "2020-04-05",
  description: "checkup",
};

function renderRoute(
  path: string,
  Component: typeof VisitAdd,
  loader?: typeof addLoader,
) {
  const router = createMemoryRouter([{ path, Component, loader }], {
    initialEntries: [path],
  });
  return render(<RouterProvider router={router} />);
}

describe("visit pages", () => {
  beforeEach(() => {
    vi.mocked(getOwnerById).mockResolvedValue(owner);
    vi.mocked(getPetById).mockResolvedValue(pet);
    vi.mocked(getVisitById).mockResolvedValue(visit);
  });

  it("renders new visit summary and form contract", async () => {
    renderRoute("/pets/:id/visits/add", VisitAdd, addLoader);
    expect(
      await screen.findByRole("heading", { name: "New Visit" }),
    ).toBeVisible();
    expect(screen.getByText("Previous Visits")).toBeVisible();
    expect(document.querySelector('input[name="date"]')).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Description" }),
    ).toHaveAttribute("id", "description");
    expect(screen.getByRole("button", { name: "Add Visit" })).toBeVisible();
  });

  it("renders edit defaults and heading", async () => {
    renderRoute("/visits/:id/edit", VisitEdit, editLoader);
    expect(
      await screen.findByRole("heading", { name: "Edit Visit" }),
    ).toBeVisible();
    expect(screen.getByDisplayValue("2020/04/05")).toHaveAttribute(
      "name",
      "date",
    );
    expect(screen.getByRole("textbox", { name: "Description" })).toHaveValue(
      "checkup",
    );
    expect(screen.getByRole("button", { name: "Update Visit" })).toBeVisible();
  });

  it("renders the bare visit list with one table", () => {
    renderRoute("/visits", VisitList);
    expect(document.querySelectorAll(".table")).toHaveLength(1);
  });
});
