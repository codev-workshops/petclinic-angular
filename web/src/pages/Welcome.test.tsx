import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Welcome } from "./Welcome";

describe("Welcome", () => {
  it("renders the legacy heading and pets logo contract", () => {
    render(<Welcome />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Welcome to Petclinic",
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Welcome",
    );
    expect(screen.getByAltText("pets logo")).toBeInTheDocument();
  });
});
