import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { addOwner } from "../../../api";
import { Component } from "./OwnerAddPage";

vi.mock("../../../api", () => ({ addOwner: vi.fn() }));

function Location() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

function renderAdd() {
  const router = createMemoryRouter(
    [
      { path: "/owners/add", element: <Component /> },
      { path: "/owners", element: <Location /> },
    ],
    { initialEntries: ["/owners/add"] },
  );
  return render(<RouterProvider router={router} />);
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("OwnerAddPage", () => {
  it("renders fields and legacy validation messages", () => {
    renderAdd();
    expect(screen.getByRole("heading", { name: "New Owner" })).toBeVisible();
    expect(screen.getByLabelText("First Name")).toHaveAttribute(
      "maxlength",
      "30",
    );
    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "123" },
    });
    expect(
      screen.getByText("First name must consist of letters only"),
    ).toBeVisible();
  });

  it("posts the owner and returns to the owners list", async () => {
    vi.mocked(addOwner).mockResolvedValue({} as never);
    renderAdd();
    const values = {
      "First Name": "Alice",
      "Last Name": "Jones",
      Address: "3 Pine Road",
      City: "Capital City",
      Telephone: "9876543210",
    };
    for (const [label, value] of Object.entries(values))
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    fireEvent.click(screen.getByRole("button", { name: "Add Owner" }));
    await waitFor(() => expect(addOwner).toHaveBeenCalled());
    expect(vi.mocked(addOwner).mock.calls[0][0]).toMatchObject({
      id: null,
      firstName: "Alice",
      lastName: "Jones",
    });
    expect(await screen.findByTestId("location")).toHaveTextContent("/owners");
  });
});
