import {
  fireEvent,
  render,
  screen,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { SpecialtyAddForm } from "./SpecialtyAddForm";
import { Component as List } from "./SpecialtyListPage";
import { addSpecialty } from "../../api/specialties";

vi.mock("../../api/specialties", () => ({
  addSpecialty: vi.fn().mockResolvedValue({ id: 4, name: "oncology" }),
  deleteSpecialty: vi.fn(),
  getSpecialties: vi.fn(),
}));

afterEach(cleanup);

describe("specialty pages", () => {
  it("renders the legacy list contract", async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/specialties",
          loader: () => ({
            specialties: [
              { id: 1, name: "radiology" },
              { id: 2, name: "surgery" },
            ],
          }),
          Component: List,
        },
      ],
      { initialEntries: ["/specialties"] },
    );
    render(<RouterProvider router={router} />);
    expect(
      await screen.findByRole("heading", { name: "Specialties" }),
    ).toBeInTheDocument();
    expect(document.querySelector("#specialties")).toBeInTheDocument();
    expect(
      document.querySelectorAll("#specialties .form-control"),
    ).toHaveLength(2);
    expect(screen.getByText("Add", { exact: true })).toBeInTheDocument();
  });

  it("posts the explicit null-id payload and exposes validation text", async () => {
    render(<SpecialtyAddForm />);
    const input = screen.getByLabelText("Name");
    fireEvent.change(input, { target: { value: "oncology" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(addSpecialty).toHaveBeenCalledWith({ id: null, name: "oncology" }),
    );
    fireEvent.change(input, { target: { value: "!" } });
    fireEvent.blur(input);
    expect(
      screen.getByText("Name must begin with a letter or digit"),
    ).toBeVisible();
  });
});
