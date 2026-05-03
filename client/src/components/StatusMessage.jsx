export default function StatusMessage({ type = 'info', message = '' }) {
  if (!message) return null;

  return (
    <div className={`status-message ${type}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
