import {
  fireEvent,
  render,
  screen,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Visit } from "../api/types";
import { VisitList } from "./VisitList";

const visits = [
  { id: 1, date: "2024-01-20", description: "One" },
  { id: 2, date: "2024-01-21", description: "Two" },
] as Visit[];

afterEach(cleanup);

describe("VisitList", () => {
  it("renders headers and one row per visit, including an initially empty list", () => {
    const { rerender } = render(
      <VisitList
        visits={visits}
        onEditVisit={vi.fn()}
        onDeleteVisit={vi.fn()}
      />,
    );
    expect(document.querySelector("table.table-condensed")).toBeInTheDocument();
    expect(screen.getByText("Visit Date")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
    cleanup();
    render(
      <VisitList visits={[]} onEditVisit={vi.fn()} onDeleteVisit={vi.fn()} />,
    );
    expect(document.querySelector("table.table-condensed")).not.toHaveAttribute(
      "hidden",
    );
  });
  it("removes one row and hides only after the last delete", async () => {
    const onDeleteVisit = vi.fn().mockResolvedValue(undefined);
    render(
      <VisitList
        visits={visits}
        onEditVisit={vi.fn()}
        onDeleteVisit={onDeleteVisit}
      />,
    );
    fireEvent.click(screen.getAllByRole("button", { name: "Delete Visit" })[0]);
    await waitFor(() =>
      expect(screen.queryByText("One")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Two")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete Visit" }));
    await waitFor(() =>
      expect(document.querySelector("table.table-condensed")).toHaveAttribute(
        "hidden",
      ),
    );
  });
});
