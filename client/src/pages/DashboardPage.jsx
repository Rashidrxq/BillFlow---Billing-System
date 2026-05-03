import { Link } from 'react-router-dom';
import StatusMessage from '../components/StatusMessage';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DashboardPage({ products, isLoading, feedback }) {
  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>BillFlow overview</h1>
          <p className="intro-text">A modern store dashboard with quick insights into stock, billing and inventory health.</p>
          {feedback.message && <StatusMessage type={feedback.type} message={feedback.message} />}
        </div>
      </div>

      <div className="page-hero">
        <div>
          <p className="eyebrow">Retail point-of-sale</p>
          <h3>Everything you need to run fast, polished billing.</h3>
          <p>Quickly manage product inventory, supplier purchases, and invoice generation from one elevated workspace.</p>
        </div>
        <div className="hero-actions">
          <Link to="/products" className="button button-primary">Manage products</Link>
          <Link to="/purchase" className="button button-secondary">Record purchase</Link>
          <Link to="/billing" className="button button-secondary">Create invoice</Link>
        </div>
      </div>

      {isLoading ? (
        <div className="dashboard-loading">
          <LoadingSpinner label="Refreshing dashboard…" />
        </div>
      ) : (
        <div className="dashboard-cards">
          <article className="metric-card">
            <span>Catalog items</span>
            <strong>{products.length}</strong>
            <p>All active products available for purchase, billing, and inventory tracking.</p>
          </article>
          <article className="metric-card">
            <span>Quick actions</span>
            <strong>Speedy workflows</strong>
            <p>Move from stock updates to invoice creation with a single click.</p>
          </article>
          <article className="metric-card">
            <span>Invoice engine</span>
            <strong>GST-ready</strong>
            <p>Create polished invoices with tax calculation and PDF export.</p>
          </article>
        </div>
      )}
    </div>
  );
}
