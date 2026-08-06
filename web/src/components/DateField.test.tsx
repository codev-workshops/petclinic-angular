import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useForm } from "react-hook-form";
import { DateField } from "./DateField";
import { Form } from "./Form";
import { SubmitButton } from "./SubmitButton";
import { parseLegacyDate } from "./dateFormat";

afterEach(cleanup);

function DateHarness({
  onSubmit = vi.fn(),
}: {
  onSubmit?: (values: unknown) => void;
}) {
  const methods = useForm({ defaultValues: { date: "" } });
  return (
    <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
      <DateField
        name="date"
        label="Date"
        rules={{ required: true }}
        messages={{ required: "Date required" }}
      />
      <SubmitButton>Save</SubmitButton>
    </Form>
  );
}

describe("DateField", () => {
  it("accepts both formats, displays slashes, and submits ISO", async () => {
    expect(parseLegacyDate("2024-01-20")).toBe("2024-01-20");
    expect(parseLegacyDate("2024/01/20")).toBe("2024-01-20");
    const onSubmit = vi.fn();
    render(<DateHarness onSubmit={onSubmit} />);
    const input = screen.getByLabelText("Date");
    fireEvent.change(input, { target: { value: "2024-01-20" } });
    expect(input).toHaveValue("2024/01/20");
    fireEvent.submit(input.closest("form")!);
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { date: "2024-01-20" },
        expect.anything(),
      ),
    );
  });
  it("rejects invalid dates and shows required after clearing", () => {
    render(<DateHarness />);
    const input = screen.getByLabelText("Date");
    fireEvent.change(input, { target: { value: "01/20/2024" } });
    expect(input.closest(".form-group")).toHaveClass("has-error");
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    fireEvent.change(input, { target: { value: "2024-13-45" } });
    expect(input.closest(".form-group")).toHaveClass("has-error");
    fireEvent.change(input, { target: { value: "2024/01/20" } });
    fireEvent.change(input, { target: { value: "" } });
    expect(screen.getByText("Date required")).toBeVisible();
  });
});
