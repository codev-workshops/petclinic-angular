import {
  fireEvent,
  render,
  screen,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { Component as List } from "./VetListPage";
import { Component as Add } from "./VetAddPage";
import { addVet } from "../../api/vets";

vi.mock("../../api/vets", () => ({
  addVet: vi.fn().mockResolvedValue({ id: 4 }),
  deleteVet: vi.fn(),
  getVets: vi.fn(),
  getVetById: vi.fn(),
  updateVet: vi.fn(),
}));
vi.mock("../../api/specialties", () => ({
  getSpecialties: vi.fn(),
}));

afterEach(cleanup);

describe("vet pages", () => {
  it("renders names, specialties, and controls", async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/vets",
          loader: () => ({
            vets: [
              {
                id: 1,
                firstName: "James",
                lastName: "Carter",
                specialties: [{ id: 1, name: "radiology" }],
              },
            ],
          }),
          Component: List,
        },
      ],
      { initialEntries: ["/vets"] },
    );
    render(<RouterProvider router={router} />);
    expect(
      await screen.findByRole("heading", { name: "Veterinarians" }),
    ).toBeInTheDocument();
    expect(screen.getByText("James Carter")).toBeInTheDocument();
    expect(screen.getByText("radiology")).toBeInTheDocument();
    expect(screen.getByText("Add Vet", { exact: true })).toBeInTheDocument();
  });

  it("posts selected specialty as an object", async () => {
    render(
      <RouterProvider
        router={createMemoryRouter(
          [
            {
              path: "/vets/add",
              loader: () => ({
                specialties: [{ id: 3, name: "dentistry" }],
              }),
              Component: Add,
            },
            {
              path: "/vets",
              loader: () => ({ vets: [] }),
              Component: List,
            },
          ],
          { initialEntries: ["/vets/add"] },
        )}
      />,
    );
    fireEvent.change(await screen.findByLabelText("First Name"), {
      target: { value: "Sarah" },
    });
    fireEvent.change(await screen.findByLabelText("Last Name"), {
      target: { value: "Jones" },
    });
    fireEvent.change(await screen.findByLabelText(/Type/), {
      target: { value: "3" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Vet" }));
    await waitFor(() =>
      expect(addVet).toHaveBeenCalledWith({
        id: null,
        firstName: "Sarah",
        lastName: "Jones",
        specialties: [{ id: 3, name: "dentistry" }],
      }),
    );
  });
});
