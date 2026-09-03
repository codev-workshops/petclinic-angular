import './LoadingIndicator.css';

interface LoadingIndicatorProps {
  label?: string;
}

/** Shown while the first request of a view is in flight. */
export default function LoadingIndicator({ label = 'Loading...' }: LoadingIndicatorProps) {
  return (
    <div className="loading-indicator" role="status" aria-live="polite">
      <span className="glyphicon glyphicon-refresh loading-indicator-spin" aria-hidden="true"></span>
      <span> {label}</span>
    </div>
  );
}
