import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useForm } from "react-hook-form";
import { Form } from "./Form";
import { FormField } from "./FormField";
import { SubmitButton } from "./SubmitButton";

function Harness() {
  const methods = useForm({ defaultValues: { a: "", b: "" } });
  return (
    <Form methods={methods}>
      <FormField name="a" label="A" rules={{ required: true }} />
      <FormField name="b" label="B" rules={{ required: true }} />
      <SubmitButton>Save</SubmitButton>
    </Form>
  );
}

describe("SubmitButton", () => {
  it("stays disabled while any field is invalid and enables when all are valid", () => {
    render(<Harness />);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText("A"), { target: { value: "a" } });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText("B"), { target: { value: "b" } });
    expect(button).toBeEnabled();
  });
});
