export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="spinner-row">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
