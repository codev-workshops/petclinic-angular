import {
  fireEvent,
  render,
  screen,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { PettypeAddForm } from "./PettypeAddForm";
import { Component as List } from "./PettypeListPage";
import { addPetType } from "../../api/pettypes";

vi.mock("../../api/pettypes", () => ({
  addPetType: vi.fn().mockResolvedValue({ id: 4, name: "hamster" }),
  deletePetType: vi.fn(),
  getPetTypes: vi.fn(),
}));

afterEach(cleanup);

describe("pet type pages", () => {
  it("renders the legacy list table and readonly row inputs", async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/pettypes",
          loader: () => ({
            petTypes: [
              { id: 1, name: "cat" },
              { id: 2, name: "dog" },
            ],
          }),
          Component: List,
        },
      ],
      { initialEntries: ["/pettypes"] },
    );
    render(<RouterProvider router={router} />);
    expect(
      await screen.findByRole("heading", { name: "Pet Types" }),
    ).toBeInTheDocument();
    expect(document.querySelector("#pettypes")).toBeInTheDocument();
    expect(document.querySelectorAll("#pettypes .form-control")).toHaveLength(
      2,
    );
    expect(document.querySelector("#pettypes .form-control")).toHaveAttribute(
      "readonly",
    );
    expect(screen.getByText("Add", { exact: true })).toBeInTheDocument();
  });

  it("posts the explicit null-id payload from the add form", async () => {
    render(<PettypeAddForm />);
    const input = screen.getByLabelText("Name");
    fireEvent.change(input, { target: { value: "hamster" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(addPetType).toHaveBeenCalledWith({ id: null, name: "hamster" }),
    );
  });

  it("shows the required validation message", () => {
    render(<PettypeAddForm />);
    const input = screen.getByLabelText("Name");
    fireEvent.change(input, { target: { value: "x" } });
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);
    expect(screen.getByText("Name is required")).toBeVisible();
    expect(input).toHaveAttribute("maxlength", "80");
  });
});
