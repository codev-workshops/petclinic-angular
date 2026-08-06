import { useController, useFormContext } from "react-hook-form";
import type { InputHTMLAttributes } from "react";
import { FormGroup, type FormGroupProps } from "./FormGroup";
import { useFieldState } from "./formContext";
import { formatLegacyDate, parseLegacyDate } from "./dateFormat";

export interface DateFieldProps
  extends Omit<FormGroupProps, "children">,
    Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "value"> {
  name: string;
}

export function DateField({
  name,
  rules = {},
  label,
  labelFor,
  messages,
  feedback,
  requiredOnSubmit,
  labelClassName,
  controlClassName,
  id,
  className,
  ...props
}: DateFieldProps) {
  const { control } = useFormContext();
  const state = useFieldState(name);
  const { field } = useController({ name, control });
  const dateRules = { ...rules, date: true };
  const stored = typeof field.value === "string" ? field.value : "";
  return (
    <FormGroup
      name={name}
      label={label}
      labelFor={labelFor}
      messages={messages}
      feedback={feedback}
      requiredOnSubmit={requiredOnSubmit}
      labelClassName={labelClassName}
      controlClassName={controlClassName}
      rules={dateRules}
    >
      <input
        {...props}
        {...field}
        id={id ?? name}
        name={name}
        type="text"
        className={className ?? "form-control"}
        value={formatLegacyDate(stored)}
        onChange={(event) => {
          state.markDirty();
          const raw = event.currentTarget.value;
          field.onChange(raw === "" ? "" : (parseLegacyDate(raw) ?? raw));
        }}
      />
    </FormGroup>
  );
}
