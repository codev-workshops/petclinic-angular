import type { ReactNode } from "react";
import { useEffect } from "react";
import { useFieldState } from "./formContext";
import type { ErrorKind, FieldRules } from "./validation";

export interface FormGroupProps {
  name: string;
  label: string;
  labelFor?: string | null;
  rules?: FieldRules;
  messages?: Partial<Record<ErrorKind, string>>;
  feedback?: "immediate" | "dirty";
  requiredOnSubmit?: boolean;
  hasFeedback?: boolean;
  labelClassName?: string;
  controlClassName?: string;
  children: ReactNode;
}

export function FormGroup({
  name,
  label,
  labelFor,
  rules = {},
  messages = {},
  feedback = "immediate",
  requiredOnSubmit = false,
  hasFeedback = true,
  labelClassName = "col-sm-2 control-label",
  controlClassName = "col-sm-10",
  children,
}: FormGroupProps) {
  const state = useFieldState(name);
  const rulesKey = JSON.stringify(rules);
  const { registerField } = state;
  useEffect(
    () => registerField(JSON.parse(rulesKey) as FieldRules),
    [name, rulesKey, registerField],
  );
  const valid = state.errors.length === 0;
  const showState = feedback === "immediate" || state.dirty;
  const classes = ["form-group"];
  if (hasFeedback) {
    classes.push("has-feedback");
    if (showState) classes.push(valid ? "has-success" : "has-error");
  }
  const visibleErrors = state.errors.filter(
    (kind) =>
      messages[kind] &&
      (state.dirty ||
        (state.submitted && requiredOnSubmit && kind === "required")),
  );
  return (
    <div className={classes.join(" ")}>
      <label
        className={labelClassName}
        htmlFor={labelFor === null ? undefined : (labelFor ?? name)}
      >
        {label}
      </label>
      <div className={controlClassName}>
        {children}
        {hasFeedback && (
          <span
            className={`glyphicon form-control-feedback glyphicon-${
              valid ? "ok" : "remove"
            }`}
            aria-hidden="true"
          />
        )}
        {visibleErrors.map((kind) => (
          <span className="help-block" key={kind}>
            {messages[kind]}
          </span>
        ))}
      </div>
    </div>
  );
}
