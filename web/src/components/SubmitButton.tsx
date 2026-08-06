import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormValidity } from "./formContext";

export interface SubmitButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function SubmitButton({
  className,
  children,
  ...props
}: SubmitButtonProps) {
  const valid = useFormValidity();
  return (
    <button
      {...props}
      type="submit"
      className={className ?? "btn btn-default"}
      disabled={!valid || props.disabled}
    >
      {children}
    </button>
  );
}
