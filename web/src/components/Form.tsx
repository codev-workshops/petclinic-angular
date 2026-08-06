import { FormProvider, type UseFormReturn } from "react-hook-form";
import {
  useCallback,
  useMemo,
  useState,
  type FormHTMLAttributes,
  type ReactNode,
} from "react";
import { FormStateContext, type FormContextValue } from "./formContext";
import type { FieldRules } from "./validation";

export interface FormProps<T extends Record<string, unknown>>
  extends Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  methods: UseFormReturn<T>;
  onSubmit?: FormHTMLAttributes<HTMLFormElement>["onSubmit"];
  children: ReactNode;
}

export function Form<T extends Record<string, unknown>>({
  methods,
  onSubmit,
  children,
  ...props
}: FormProps<T>) {
  const [fields, setFields] = useState<Record<string, FieldRules>>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const registerField = useCallback((name: string, rules: FieldRules) => {
    setFields((current) => {
      if (JSON.stringify(current[name]) === JSON.stringify(rules))
        return current;
      return { ...current, [name]: rules };
    });
    return () =>
      setFields((current) => {
        const next = { ...current };
        delete next[name];
        return next;
      });
  }, []);
  const markDirty = useCallback((name: string) => {
    setDirty((current) => {
      if (current.has(name)) return current;
      return new Set(current).add(name);
    });
  }, []);
  const context = useMemo<FormContextValue>(
    () => ({ fields, registerField, markDirty, dirty, submitted }),
    [fields, registerField, markDirty, dirty, submitted],
  );
  return (
    <FormProvider {...methods}>
      <FormStateContext.Provider value={context}>
        <form
          {...props}
          className={props.className ?? "form-horizontal"}
          noValidate={props.noValidate ?? true}
          onSubmit={(event) => {
            setSubmitted(true);
            onSubmit?.(event);
          }}
        >
          {children}
        </form>
      </FormStateContext.Provider>
    </FormProvider>
  );
}
