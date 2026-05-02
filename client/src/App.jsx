import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import Invoice from './Invoice';

function MainApp() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [stockQuantity, setStockQuantity] = useState('0');

  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [backendError, setBackendError] = useState(null);

  const [invoiceId, setInvoiceId] = useState(null);
  const [purchaseProductId, setPurchaseProductId] = useState('');
  const [purchaseVendor, setPurchaseVendor] = useState('');
  const [purchaseQuantity, setPurchaseQuantity] = useState('0');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [purchaseReference, setPurchaseReference] = useState('');

  const units = ['pcs', 'kg', 'g', 'ltr', 'box'];
  const GST_RATE = 0.18;
  const subTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const gstAmount = parseFloat((subTotal * GST_RATE).toFixed(2));
  const totalWithTax = parseFloat((subTotal + gstAmount).toFixed(2));

  const navigate = useNavigate();

  const fetchProducts = () => {
    fetch('http://localhost:3000/products')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Server responded ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setBackendError(null);
      })
      .catch(err => {
        console.error('Failed to load products:', err);
        setProducts([]);
        setBackendError('Backend unavailable at http://localhost:3000. Start the server and refresh.');
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = () => {
    fetch('http://localhost:3000/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        brand,
        unit,
        costPrice: Number(costPrice),
        sellPrice: Number(sellPrice),
        stockQuantity: Number(stockQuantity)
      })
    })
      .then(res => res.json())
      .then(() => {
        setName('');
        setBrand('');
        setCostPrice('');
        setSellPrice('');
        setUnit('pcs');
        setStockQuantity('0');
        fetchProducts();
      });
  };

  const purchaseInventory = () => {
    if (!purchaseProductId) {
      alert('Select a product to purchase');
      return;
    }

    fetch('http://localhost:3000/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: Number(purchaseProductId),
        vendor: purchaseVendor,
        quantity: Number(purchaseQuantity),
        unit: products.find(p => p.id == purchaseProductId)?.unit || 'pcs',
        costPrice: Number(purchaseCost),
        reference: purchaseReference
      })
    })
      .then(res => res.json())
      .then(() => {
        setPurchaseProductId('');
        setPurchaseVendor('');
        setPurchaseQuantity('0');
        setPurchaseCost('');
        setPurchaseReference('');
        fetchProducts();
      });
  };

  const deleteProduct = (id) => {
    fetch(`http://localhost:3000/products/${id}`, {
      method: 'DELETE'
    }).then(() => fetchProducts());
  };

  const addToCart = () => {
    const product = products.find(p => p.id == selectedProduct);
    if (!product) return;

    const quantityNumber = Number(quantity);
    const price = Number(product.sell_price ?? 0);
    const item = {
      id: product.id,
      name: product.name,
      unit: product.unit || 'pcs',
      quantity: quantityNumber,
      price,
      total: price * quantityNumber
    };

    setCart([...cart, item]);
  };

  const generateBill = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    fetch('http://localhost:3000/invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cart,
        subTotal,
        gstAmount,
        total: totalWithTax,
        paymentMode
      })
    })
      .then(res => res.json())
      .then(data => {
        setInvoiceId(data.invoiceId);
        setCart([]);
      });
  };

  const invoiceURL = invoiceId
    ? `${window.location.origin}/invoice/${invoiceId}`
    : '';

  return (
    <div className="app-shell">
      {backendError && (
        <div className="error-banner">
          {backendError}
        </div>
      )}
      <header className="app-header">
        <div>
          <p className="eyebrow">Enterprise Retail POS</p>
          <h1>BillFlow Enterprise</h1>
          <p className="intro-text">Track purchases and sales with real inventory control, units, cost vs sell price, and GST-ready invoices.</p>
        </div>

        <div className="status-card">
          <span>Live products</span>
          <strong>{products.length}</strong>
          <p>Accurate stock balances with purchase history and automated inventory updates.</p>
        </div>
      </header>

      <div className="layout-columns">
        <section className="section">
          <div className="section-header">
            <div>
              <h2>Product catalog</h2>
              <p>Products now carry brand, unit, cost price, selling price, and stock levels.</p>
            </div>
          </div>

          <div className="panel form-panel">
            <div className="card-title">Add new product</div>
            <div className="form-grid">
              <div className="field">
                <label>Product name</label>
                <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Fresh Apples" />
              </div>
              <div className="field">
                <label>Brand</label>
                <input className="input-field" value={brand} onChange={e => setBrand(e.target.value)} placeholder="Brand name" />
              </div>
              <div className="field">
                <label>Unit</label>
                <select className="input-field" value={unit} onChange={e => setUnit(e.target.value)}>
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Cost price</label>
                <input className="input-field" type="number" min="0" step="0.01" value={costPrice} onChange={e => setCostPrice(e.target.value)} placeholder="0" />
              </div>
              <div className="field">
                <label>Selling price</label>
                <input className="input-field" type="number" min="0" step="0.01" value={sellPrice} onChange={e => setSellPrice(e.target.value)} placeholder="0" />
              </div>
              <div className="field">
                <label>Stock quantity</label>
                <input className="input-field" type="number" min="0" step="0.001" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} placeholder="0" />
              </div>
              <button type="button" className="button button-primary" onClick={addProduct}>Add product</button>
            </div>
          </div>

          <div className="panel form-panel">
            <div className="card-title">Record purchase</div>
            <div className="form-grid">
              <div className="field">
                <label>Product</label>
                <select className="input-field" value={purchaseProductId} onChange={e => setPurchaseProductId(e.target.value)}>
                  <option value="">Select product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Vendor</label>
                <input className="input-field" value={purchaseVendor} onChange={e => setPurchaseVendor(e.target.value)} placeholder="Vendor or supplier" />
              </div>
              <div className="field">
                <label>Quantity</label>
                <input className="input-field" type="number" min="0" step="0.001" value={purchaseQuantity} onChange={e => setPurchaseQuantity(e.target.value)} placeholder="0" />
              </div>
              <div className="field">
                <label>Cost per unit</label>
                <input className="input-field" type="number" min="0" step="0.01" value={purchaseCost} onChange={e => setPurchaseCost(e.target.value)} placeholder="0" />
              </div>
              <div className="field">
                <label>Reference</label>
                <input className="input-field" value={purchaseReference} onChange={e => setPurchaseReference(e.target.value)} placeholder="Purchase invoice / receipt" />
              </div>
              <button type="button" className="button button-primary" onClick={purchaseInventory}>Record purchase</button>
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
                products.map(p => (
                  <div key={p.id} className="table-row">
                    <span>{p.name}</span>
                    <span>{p.brand || '-'}</span>
                    <span>₹{Number(p.cost_price ?? 0).toFixed(2)}</span>
                    <span>₹{Number(p.sell_price ?? 0).toFixed(2)}</span>
                    <span>{p.stock_quantity ?? 0}</span>
                    <span>{p.unit || '-'}</span>
                    <button type="button" className="button button-ghost" onClick={() => deleteProduct(p.id)}>Delete</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="section billing-section">
          <div className="section-header">
            <div>
              <h2>Billing desk</h2>
              <p>Create sales invoices and automatically reduce stock for each item sold.</p>
            </div>
          </div>

          <div className="panel billing-panel">
            <div className="form-grid">
              <div className="field">
                <label>Item</label>
                <select className="input-field" onChange={e => setSelectedProduct(e.target.value)} value={selectedProduct}>
                  <option value="">Select product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — ₹{Number(p.sell_price ?? 0).toFixed(2)} / {p.unit || '-'}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Quantity</label>
                <input className="input-field" type="number" min="1" step="0.001" value={quantity} onChange={e => setQuantity(e.target.value)} />
              </div>
              <div className="field">
                <label>Payment mode</label>
                <select className="input-field" value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
              <button type="button" className="button button-primary" onClick={addToCart}>Add to cart</button>
            </div>

            <div className="cart-summary">
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
                    <div className="item-total">₹{item.total.toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>

            <div className="summary-box">
              <div className="summary-item"><span>Subtotal</span><strong>₹{subTotal.toFixed(2)}</strong></div>
              <div className="summary-item"><span>GST ({(GST_RATE * 100).toFixed(0)}%)</span><strong>₹{gstAmount.toFixed(2)}</strong></div>
              <div className="summary-item total-row"><span>Total due</span><strong>₹{totalWithTax.toFixed(2)}</strong></div>
            </div>

            <button type="button" className="button button-primary button-block" onClick={generateBill}>Generate invoice</button>
          </div>

          {invoiceId && (
            <div className="panel qr-panel">
              <div>
                <div className="card-title">Invoice generated</div>
                <p>Scan the QR to open the invoice on any device.</p>
              </div>
              <div className="qr-stack">
                <QRCodeCanvas value={invoiceURL} size={144} />
                <a className="link-button" href={invoiceURL} target="_blank" rel="noreferrer">View invoice</a>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/invoice/:id" element={<Invoice />} />
      </Routes>
    </Router>
  );
}

export default App;
