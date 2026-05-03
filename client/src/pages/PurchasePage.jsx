import StatusMessage from '../components/StatusMessage';

export default function PurchasePage({
  products,
  purchaseProductId,
  purchaseVendor,
  purchaseQuantity,
  purchaseCost,
  purchaseReference,
  onFieldChange,
  onSubmitPurchase,
  isSaving,
  feedback,
}) {
  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Purchase</p>
          <h1>Stock replenishment</h1>
          <p className="intro-text">Record supplier purchases and update inventory with accurate cost and reference details.</p>
          {feedback.message && <StatusMessage type={feedback.type} message={feedback.message} />}
        </div>
      </div>

      <div className="panel form-panel">
        <div className="card-title">Record purchase</div>
        <div className="form-grid">
          <div className="field">
            <label>Product</label>
            <select className="input-field" value={purchaseProductId} onChange={(e) => onFieldChange('purchaseProductId', e.target.value)}>
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Vendor</label>
            <input className="input-field" value={purchaseVendor} onChange={(e) => onFieldChange('purchaseVendor', e.target.value)} placeholder="Vendor or supplier" />
          </div>
          <div className="field">
            <label>Quantity</label>
            <input className="input-field" type="number" min="0" step="0.001" value={purchaseQuantity} onChange={(e) => onFieldChange('purchaseQuantity', e.target.value)} placeholder="0" />
          </div>
          <div className="field">
            <label>Cost per unit</label>
            <input className="input-field" type="number" min="0" step="0.01" value={purchaseCost} onChange={(e) => onFieldChange('purchaseCost', e.target.value)} placeholder="0" />
          </div>
          <div className="field">
            <label>Reference</label>
            <input className="input-field" value={purchaseReference} onChange={(e) => onFieldChange('purchaseReference', e.target.value)} placeholder="Purchase invoice / receipt" />
          </div>
          <button type="button" className="button button-primary" onClick={onSubmitPurchase} disabled={isSaving}>{isSaving ? 'Saving…' : 'Record purchase'}</button>
        </div>
      </div>
    </div>
  );
}
