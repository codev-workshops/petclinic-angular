import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Component as PetAdd, loader as addLoader } from "./PetAddPage";
import { Component as PetEdit, loader as editLoader } from "./PetEditPage";
import { Component as PetList } from "./PetListPage";
import { addPet } from "../../api/pets";
import { getOwnerById } from "../../api/owners";
import { getPetTypes } from "../../api/pettypes";
import { getPetById, updatePet } from "../../api/pets";

vi.mock("../../api/pets", () => ({
  addPet: vi.fn(() => Promise.resolve({})),
  deletePet: vi.fn(() => Promise.resolve()),
  getPetById: vi.fn(),
  updatePet: vi.fn(() => Promise.resolve({})),
}));
vi.mock("../../api/owners", () => ({ getOwnerById: vi.fn() }));
vi.mock("../../api/pettypes", () => ({ getPetTypes: vi.fn() }));
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
const type = { id: 1, name: "dog" };
const pet = {
  id: 1,
  ownerId: 1,
  name: "Leo",
  birthDate: "2010-01-02",
  type,
  owner: expect.objectContaining({ id: 0 }),
  visits: [],
};

function renderRoute(
  path: string,
  Component: typeof PetAdd,
  loader?: typeof addLoader,
) {
  const router = createMemoryRouter([{ path, Component, loader }], {
    initialEntries: [path],
  });
  return render(<RouterProvider router={router} />);
}

describe("pet pages", () => {
  beforeEach(() => {
    vi.mocked(getOwnerById).mockResolvedValue(owner);
    vi.mocked(getPetTypes).mockResolvedValue([type]);
    vi.mocked(getPetById).mockResolvedValue(pet);
  });

  it("renders pet add's legacy fields and submits its payload", async () => {
    renderRoute("/pets/add", PetAdd, addLoader);
    expect(
      await screen.findByRole("heading", { name: "Add Pet" }),
    ).toBeVisible();
    expect(document.querySelector("#owner_name")).toHaveValue(" ");
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Max" },
    });
    fireEvent.change(document.querySelector('input[name="birthDate"]')!, {
      target: { value: "2012-03-04" },
    });
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Pet" }));
    await waitFor(() =>
      expect(addPet).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Max",
          birthDate: "2012-03-04",
          owner: expect.objectContaining({ id: 0 }),
        }),
      ),
    );
  });

  it("renders pet edit ids, defaults, and heading", async () => {
    renderRoute("/pets/:id/edit", PetEdit, editLoader);
    expect(await screen.findByRole("heading", { name: "Pet" })).toBeVisible();
    expect(screen.getByLabelText("Name")).toHaveValue("Leo");
    expect(screen.getByDisplayValue("2010/01/02")).toHaveAttribute(
      "name",
      "birthDate",
    );
    expect(document.querySelector("#type1")).toHaveValue("dog");
    expect(screen.getByRole("combobox")).toHaveAttribute("name", "pettype");
  });

  it("renders the bare pet list shell", () => {
    renderRoute("/pets", PetList);
    expect(screen.getByRole("button", { name: "Edit Pet" })).toBeVisible();
    expect(document.querySelectorAll(".table")).toHaveLength(2);
  });
});
