import StatusMessage from '../components/StatusMessage';

export default function ProductsPage({
  products,
  name,
  brand,
  unit,
  costPrice,
  sellPrice,
  stockQuantity,
  units,
  onFieldChange,
  onAddProduct,
  onDeleteProduct,
  isSaving,
  feedback,
}) {
  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Products</p>
          <h1>Catalog management</h1>
          <p className="intro-text">Add new products, track stock units, and keep your catalog up to date.</p>
          {feedback.message && <StatusMessage type={feedback.type} message={feedback.message} />}
        </div>
      </div>

      <div className="panel form-panel">
        <div className="card-title">Add new product</div>
        <div className="form-grid">
          <div className="field">
            <label>Product name</label>
            <input className="input-field" value={name} onChange={(e) => onFieldChange('name', e.target.value)} placeholder="Fresh Apples" />
          </div>
          <div className="field">
            <label>Brand</label>
            <input className="input-field" value={brand} onChange={(e) => onFieldChange('brand', e.target.value)} placeholder="Brand name" />
          </div>
          <div className="field">
            <label>Unit</label>
            <select className="input-field" value={unit} onChange={(e) => onFieldChange('unit', e.target.value)}>
              {units.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Cost price</label>
            <input className="input-field" type="number" min="0" step="0.01" value={costPrice} onChange={(e) => onFieldChange('costPrice', e.target.value)} placeholder="0" />
          </div>
          <div className="field">
            <label>Selling price</label>
            <input className="input-field" type="number" min="0" step="0.01" value={sellPrice} onChange={(e) => onFieldChange('sellPrice', e.target.value)} placeholder="0" />
          </div>
          <div className="field">
            <label>Stock quantity</label>
            <input className="input-field" type="number" min="0" step="0.001" value={stockQuantity} onChange={(e) => onFieldChange('stockQuantity', e.target.value)} placeholder="0" />
          </div>
          <button type="button" className="button button-primary" onClick={onAddProduct} disabled={isSaving}>{isSaving ? 'Saving…' : 'Add product'}</button>
        </div>
      </div>

      <div className="panel product-panel">
        <div className="card-title">Catalog overview</div>
        <div className="product-table">
          <div className="table-row table-head">
            <span>Product</span>
            <span>Brand</span>
            <span>Cost</span>
            <span>Sell</span>
            <span>Stock</span>
            <span>Unit</span>
            <span>Action</span>
          </div>
          {products.length === 0 ? (
            <div className="table-row empty-state">No products available yet.</div>
          ) : (
            products.map((p) => (
              <div key={p.id} className="table-row">
                <span>{p.name}</span>
                <span>{p.brand || '-'}</span>
                <span>₹{Number(p.cost_price ?? 0).toFixed(2)}</span>
                <span>₹{Number(p.sell_price ?? 0).toFixed(2)}</span>
                <span>{p.stock_quantity ?? 0}</span>
                <span>{p.unit || '-'}</span>
                <button type="button" className="button button-ghost small-button" onClick={() => onDeleteProduct(p.id)} disabled={isSaving}>Delete</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
