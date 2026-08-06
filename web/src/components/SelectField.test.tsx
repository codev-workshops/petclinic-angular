import {
  fireEvent,
  render,
  screen,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useForm } from "react-hook-form";
import { Form } from "./Form";
import { SelectField } from "./SelectField";
import { SubmitButton } from "./SubmitButton";

const options = [
  { id: 1, name: "cat" },
  { id: 2, name: "dog" },
  { id: 3, name: "lizard" },
];

afterEach(cleanup);

function Harness({
  multiple = false,
  onSubmit = vi.fn(),
}: {
  multiple?: boolean;
  onSubmit?: (values: unknown) => void;
}) {
  const methods = useForm({
    defaultValues: { type: multiple ? [] : undefined },
  });
  return (
    <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
      <SelectField
        name="type"
        label="Type"
        options={options}
        multiple={multiple}
        rules={{ required: true }}
      />
      <SubmitButton>Save</SubmitButton>
    </Form>
  );
}

describe("SelectField", () => {
  it("renders exactly supplied options and submits the selected object", () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);
    const select = screen.getByLabelText("Type") as HTMLSelectElement;
    expect(select.querySelectorAll("option")).toHaveLength(3);
    expect(
      Array.from(select.querySelectorAll("option")).map((o) => o.textContent),
    ).toEqual(["cat", "dog", "lizard"]);
    fireEvent.change(select, { target: { value: "2" } });
    fireEvent.submit(select.closest("form")!);
    return waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { type: { id: 2, name: "dog" } },
        expect.anything(),
      ),
    );
  });
  it("submits an array of selected option objects for multiple selects", () => {
    const onSubmit = vi.fn();
    render(<Harness multiple onSubmit={onSubmit} />);
    const select = screen.getByLabelText("Type") as HTMLSelectElement;
    (select.options[0] as HTMLOptionElement).selected = true;
    (select.options[2] as HTMLOptionElement).selected = true;
    fireEvent.change(select);
    fireEvent.submit(select.closest("form")!);
    return waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        {
          type: [
            { id: 1, name: "cat" },
            { id: 3, name: "lizard" },
          ],
        },
        expect.anything(),
      ),
    );
  });
});
