import { useFormContext, useWatch } from "react-hook-form";
import { createContext, useCallback, useContext } from "react";
import { validateField, type ErrorKind, type FieldRules } from "./validation";

export interface FormContextValue {
  fields: Record<string, FieldRules>;
  registerField: (name: string, rules: FieldRules) => () => void;
  markDirty: (name: string) => void;
  dirty: Set<string>;
  submitted: boolean;
}

export const FormStateContext = createContext<FormContextValue | null>(null);

function useFormStateContext() {
  const context = useContext(FormStateContext);
  if (!context) throw new Error("Form fields must be inside Form");
  return context;
}

export function useFormValidity() {
  const { control } = useFormContext();
  const { fields } = useFormStateContext();
  const values = useWatch({ control }) as Record<string, unknown>;
  return Object.entries(fields).every(
    ([name, rules]) => validateField(values?.[name], rules).length === 0,
  );
}

export function useFieldState(name: string): {
  errors: ErrorKind[];
  dirty: boolean;
  submitted: boolean;
  registerField: (rules: FieldRules) => () => void;
  markDirty: () => void;
} {
  const { control } = useFormContext();
  const { fields, dirty, submitted, registerField, markDirty } =
    useFormStateContext();
  const values = useWatch({ control }) as Record<string, unknown>;
  const register = useCallback(
    (rules: FieldRules) => registerField(name, rules),
    [name, registerField],
  );
  const mark = useCallback(() => markDirty(name), [name, markDirty]);
  return {
    errors: validateField(values?.[name], fields[name] ?? {}),
    dirty: dirty.has(name),
    submitted,
    registerField: register,
    markDirty: mark,
  };
}
