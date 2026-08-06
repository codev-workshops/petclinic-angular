import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useForm } from "react-hook-form";
import { Form } from "./Form";
import { FormField } from "./FormField";

afterEach(cleanup);

function Harness({
  feedback = "immediate",
}: {
  feedback?: "immediate" | "dirty";
}) {
  const methods = useForm({ defaultValues: { name: "" } });
  return (
    <Form methods={methods}>
      <FormField
        name="name"
        label="Name"
        feedback={feedback}
        rules={{
          required: true,
          minLength: 3,
          maxLength: 80,
          pattern: "^[a-z]+$",
        }}
        messages={{
          required: "Required",
          minlength: "Too short",
          maxlength: "Too long",
          pattern: "Letters only",
        }}
      />
    </Form>
  );
}

describe("FormField", () => {
  it("toggles feedback and glyphs independently of dirty state", () => {
    const { rerender } = render(<Harness />);
    const input = screen.getByLabelText("Name");
    const group = input.closest(".form-group")!;
    expect(group).toHaveClass("has-error");
    expect(group.querySelector(".form-control-feedback")).toHaveClass(
      "glyphicon-remove",
    );
    fireEvent.change(input, { target: { value: "abc" } });
    expect(group).toHaveClass("has-success");
    expect(group.querySelector(".form-control-feedback")).toHaveClass(
      "glyphicon-ok",
    );
    cleanup();
    render(<Harness feedback="dirty" />);
    const dirtyInput = screen.getByLabelText("Name");
    expect(dirtyInput.closest(".form-group")).not.toHaveClass("has-error");
    expect(dirtyInput.closest(".form-group")).not.toHaveClass("has-success");
    expect(
      dirtyInput
        .closest(".form-group")!
        .querySelector(".form-control-feedback"),
    ).toHaveClass("glyphicon-remove");
    fireEvent.change(dirtyInput, { target: { value: "abc" } });
    expect(dirtyInput.closest(".form-group")).toHaveClass("has-success");
  });

  it("renders all matching messages and passes HTML attributes", () => {
    render(<Harness />);
    const input = screen.getByLabelText("Name");
    expect(input).toHaveAttribute("id", "name");
    expect(input).toHaveAttribute("name", "name");
    expect(input).toHaveAttribute("required");
    expect(input).toHaveAttribute("minlength", "3");
    expect(input).toHaveAttribute("maxlength", "80");
    expect(input).toHaveAttribute("pattern", "^[a-z]+$");
    fireEvent.change(input, { target: { value: "1" } });
    expect(screen.getByText("Too short")).toBeVisible();
    expect(screen.getByText("Letters only")).toBeVisible();
  });

  it("keeps dirty sticky and supports requiredOnSubmit", () => {
    function RequiredHarness() {
      const methods = useForm({ defaultValues: { name: "" } });
      return (
        <Form methods={methods}>
          <FormField
            name="name"
            label="Name"
            rules={{ required: true }}
            messages={{ required: "Required" }}
            requiredOnSubmit
          />
          <button type="submit">Submit</button>
        </Form>
      );
    }
    render(<RequiredHarness />);
    const input = screen.getByLabelText("Name");
    fireEvent.change(input, { target: { value: "x" } });
    fireEvent.change(input, { target: { value: "" } });
    expect(screen.getByText("Required")).toBeVisible();
  });

  it("does not reveal pristine required text on submit without the flag", () => {
    function PlainHarness() {
      const methods = useForm({ defaultValues: { name: "" } });
      return (
        <Form methods={methods}>
          <FormField
            name="name"
            label="Name"
            rules={{ required: true }}
            messages={{ required: "Required" }}
          />
          <button type="submit">Submit</button>
        </Form>
      );
    }
    render(<PlainHarness />);
    fireEvent.submit(screen.getByRole("button", { name: "Submit" }));
    expect(screen.queryByText("Required")).not.toBeInTheDocument();
  });
});
