import StatusMessage from '../components/StatusMessage';

const GST_RATE = 0.18;

export default function BillingPage({
  products,
  cart,
  selectedProduct,
  quantity,
  paymentMode,
  invoiceURL,
  onFieldChange,
  onAddToCart,
  onRemoveCartItem,
  onGenerateBill,
  isSaving,
  feedback,
}) {
  const subTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const gstAmount = parseFloat((subTotal * GST_RATE).toFixed(2));
  const totalWithTax = parseFloat((subTotal + gstAmount).toFixed(2));

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Billing</p>
          <h1>Invoice creation</h1>
          <p className="intro-text">Build a sales invoice, preview the total, and publish with a single click.</p>
          {feedback.message && <StatusMessage type={feedback.type} message={feedback.message} />}
        </div>
      </div>

      <div className="billing-grid">
        <div className="billing-form panel">
          <div className="card-title">Add item to invoice</div>
          <div className="form-grid">
            <div className="field">
              <label>Item</label>
              <select className="input-field" onChange={(e) => onFieldChange('selectedProduct', e.target.value)} value={selectedProduct}>
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — ₹{Number(p.sell_price ?? 0).toFixed(2)} / {p.unit || '-'}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Quantity</label>
              <input className="input-field" type="number" min="1" step="0.001" value={quantity} onChange={(e) => onFieldChange('quantity', e.target.value)} />
            </div>
            <div className="field">
              <label>Payment mode</label>
              <select className="input-field" value={paymentMode} onChange={(e) => onFieldChange('paymentMode', e.target.value)}>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
            <button type="button" className="button button-primary" onClick={onAddToCart}>Add to cart</button>
          </div>
        </div>

        <div className="billing-summary-panel">
          <div className="panel cart-summary">
            <div className="cart-header">Current cart</div>
            {cart.length === 0 ? (
              <p className="empty-state">Add items to preview the bill.</p>
            ) : (
              cart.map((item, index) => (
                <div className="cart-item" key={index}>
                  <div>
                    <div className="item-name">{item.name}</div>
                    <div className="item-meta">Qty {item.quantity} {item.unit}</div>
                  </div>
                  <div className="item-actions">
                    <span className="item-total">₹{item.total.toFixed(2)}</span>
                    <button type="button" className="button button-ghost small-button" onClick={() => onRemoveCartItem(index)}>Remove</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="panel summary-box">
            <div className="summary-item"><span>Subtotal</span><strong>₹{subTotal.toFixed(2)}</strong></div>
            <div className="summary-item"><span>GST ({(GST_RATE * 100).toFixed(0)}%)</span><strong>₹{gstAmount.toFixed(2)}</strong></div>
            <div className="summary-item total-row"><span>Total due</span><strong>₹{totalWithTax.toFixed(2)}</strong></div>
          </div>

          <button type="button" className="button button-primary button-block" onClick={onGenerateBill} disabled={isSaving || cart.length === 0}>{isSaving ? 'Processing…' : 'Generate invoice'}</button>

          {invoiceURL && (
            <div className="panel qr-panel">
              <div>
                <div className="card-title">Invoice generated</div>
                <p>View or share the invoice using the link below.</p>
              </div>
              <div className="qr-stack">
                <a className="link-button" href={invoiceURL} target="_blank" rel="noreferrer">Open invoice</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
