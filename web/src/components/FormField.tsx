import {
  useFormContext,
  type FieldValues,
  type UseFormRegisterReturn,
} from "react-hook-form";
import type { InputHTMLAttributes } from "react";
import { FormGroup, type FormGroupProps } from "./FormGroup";
import { useFieldState } from "./formContext";
import type { FieldRules } from "./validation";

export interface FormFieldProps
  extends Omit<FormGroupProps, "children">,
    Omit<InputHTMLAttributes<HTMLInputElement>, "name"> {
  name: string;
  rules?: FieldRules;
  renderGroup?: boolean;
}

export function FormField({
  name,
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
  type = "text",
  required,
  minLength,
  maxLength,
  pattern,
  className,
  onChange,
  ...props
}: FormFieldProps) {
  const { register } = useFormContext<FieldValues>();
  const state = useFieldState(name);
  const registered = register(name) as UseFormRegisterReturn;
  const input = (
    <input
      {...registered}
      {...props}
      id={id ?? name}
      name={name}
      type={type}
      className={className ?? "form-control"}
      required={required ?? rules.required}
      minLength={minLength ?? rules.minLength}
      maxLength={maxLength ?? rules.maxLength}
      pattern={pattern ?? rules.pattern}
      onChange={(event) => {
        state.markDirty();
        registered.onChange(event);
        onChange?.(event);
      }}
    />
  );
  if (!renderGroup) return input;
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
      {input}
    </FormGroup>
  );
}
