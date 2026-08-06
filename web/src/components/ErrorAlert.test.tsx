import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ErrorAlert } from "./ErrorAlert";

describe("ErrorAlert", () => {
  it("renders only a non-empty danger alert", () => {
    const { rerender } = render(<ErrorAlert />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    rerender(<ErrorAlert message="" />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    rerender(<ErrorAlert message="Oops" />);
    expect(screen.getByText("Oops")).toHaveClass("alert-danger");
  });
});
