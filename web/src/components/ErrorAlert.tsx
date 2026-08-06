export interface ErrorAlertProps {
  message?: string | null;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return message ? <div className="alert alert-danger">{message}</div> : null;
}
