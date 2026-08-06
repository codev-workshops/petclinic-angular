import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageContainer } from "./PageContainer";

describe("PageContainer", () => {
  it("renders the Bootstrap container structure, optional heading, and children", () => {
    const { rerender } = render(
      <PageContainer title="Pets">Content</PageContainer>,
    );
    expect(
      document.querySelector(
        "div.container-fluid > div.container.xd-container",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pets" })).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    rerender(<PageContainer>Only children</PageContainer>);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
});
