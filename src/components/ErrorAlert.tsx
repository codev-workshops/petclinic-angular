import './ErrorAlert.css';

interface ErrorAlertProps {
  /** Message to show; the alert renders nothing when empty. */
  message: string | null | undefined;
  onDismiss?: () => void;
}

/** Dismissable Bootstrap 3 danger alert used for every API error surfaced to the user. */
export default function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  if (!message) {
    return null;
  }
  return (
    <div className="alert alert-danger alert-dismissible error-alert" role="alert">
      {onDismiss && (
        <button type="button" className="close" aria-label="Dismiss error" onClick={onDismiss}>
          <span aria-hidden="true">&times;</span>
        </button>
      )}
      {message}
    </div>
  );
}
