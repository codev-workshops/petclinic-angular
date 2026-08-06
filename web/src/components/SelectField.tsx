import { useController, useFormContext } from "react-hook-form";
import type { SelectHTMLAttributes } from "react";
import { FormGroup, type FormGroupProps } from "./FormGroup";
import { useFieldState } from "./formContext";

export interface SelectFieldProps<T>
  extends Omit<FormGroupProps, "children">,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, "name" | "multiple"> {
  name: string;
  options: T[];
  getOptionLabel?: (option: T) => string;
  getOptionValue?: (option: T) => string;
  multiple?: boolean;
  renderGroup?: boolean;
}

export function SelectField<T>({
  name,
  options,
  getOptionLabel = (option) => (option as { name: string }).name,
  getOptionValue = (option) => String((option as { id: number }).id),
  multiple = false,
  rules = {},
  label,
  labelFor,
  messages,
  feedback,
  requiredOnSubmit,
  hasFeedback,
  renderGroup = true,
  labelClassName,
  controlClassName,
  id,
  className,
  ...props
}: SelectFieldProps<T>) {
  const { control } = useFormContext();
  const state = useFieldState(name);
  const { field } = useController({ name, control });
  const selected = (multiple ? (field.value ?? []) : field.value) as
    | T
    | T[]
    | undefined;
  const value = multiple
    ? ((selected as T[] | undefined) ?? []).map(getOptionValue)
    : selected
      ? getOptionValue(selected as T)
      : "";
  const select = (
    <select
      {...props}
      {...field}
      id={id ?? name}
      name={name}
      className={className ?? "form-control"}
      multiple={multiple}
      value={value}
      onChange={(event) => {
        state.markDirty();
        const selectedOptions = Array.from(event.currentTarget.selectedOptions)
          .map((option) =>
            options.find((item) => getOptionValue(item) === option.value),
          )
          .filter((item): item is T => item !== undefined);
        field.onChange(multiple ? selectedOptions : selectedOptions[0]);
      }}
    >
      {options.map((option) => (
        <option key={getOptionValue(option)} value={getOptionValue(option)}>
          {getOptionLabel(option)}
        </option>
      ))}
    </select>
  );
  if (!renderGroup) return select;
  return (
    <FormGroup
      name={name}
      label={label}
      labelFor={labelFor}
      messages={messages}
      feedback={feedback}
      requiredOnSubmit={requiredOnSubmit}
      hasFeedback={hasFeedback}
      labelClassName={labelClassName}
      controlClassName={controlClassName}
      rules={rules}
    >
      {select}
    </FormGroup>
  );
}
