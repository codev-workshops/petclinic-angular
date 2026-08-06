import {
  fireEvent,
  render,
  screen,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Pet, Visit } from "../api/types";
import { PetList } from "./PetList";

const visit = { id: 1, date: "2024-01-20", description: "Checkup" } as Visit;
const pet = {
  id: 1,
  name: "Leo",
  birthDate: "2020-01-01",
  type: { id: 1, name: "cat" },
  visits: [visit],
} as Pet;

afterEach(cleanup);

describe("PetList", () => {
  it("renders the legacy DOM contract and nested visits", () => {
    render(
      <PetList
        pet={pet}
        onEditPet={vi.fn()}
        onAddVisit={vi.fn()}
        onDeletePet={vi.fn()}
        onEditVisit={vi.fn()}
        onDeleteVisit={vi.fn()}
      />,
    );
    expect(
      document.querySelector("table.table.table-striped"),
    ).toBeInTheDocument();
    expect(document.querySelector("dl.dl-horizontal")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Birth Date")).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Edit Pet" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete Pet" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Visit" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Checkup")).toBeInTheDocument();
  });
  it("fires callbacks and hides after successful delete", async () => {
    const onDeletePet = vi.fn().mockResolvedValue(undefined);
    const onEditPet = vi.fn();
    const onAddVisit = vi.fn();
    render(
      <PetList
        pet={pet}
        onEditPet={onEditPet}
        onAddVisit={onAddVisit}
        onDeletePet={onDeletePet}
        onEditVisit={vi.fn()}
        onDeleteVisit={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Pet" }));
    fireEvent.click(screen.getByRole("button", { name: "Add Visit" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete Pet" }));
    expect(onEditPet).toHaveBeenCalledWith(pet);
    expect(onAddVisit).toHaveBeenCalledWith(pet);
    expect(onDeletePet).toHaveBeenCalledWith(pet);
    await waitFor(() =>
      expect(document.querySelector("table.table-striped")).toHaveAttribute(
        "hidden",
      ),
    );
    expect(document.querySelector("table.table-striped")).not.toHaveTextContent(
      "Leo",
    );
  });
});
