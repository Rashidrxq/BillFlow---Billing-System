import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import Invoice from './Invoice';

function MainApp() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMode, setPaymentMode] = useState('Cash');

  const [invoiceId, setInvoiceId] = useState(null);
  const GST_RATE = 0.18;
  const subTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const gstAmount = parseFloat((subTotal * GST_RATE).toFixed(2));
  const totalWithTax = parseFloat((subTotal + gstAmount).toFixed(2));

  const navigate = useNavigate();

  const fetchProducts = () => {
    fetch('http://localhost:3000/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = () => {
    fetch('http://localhost:3000/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, stock })
    })
      .then(res => res.json())
      .then(() => {
        setName('');
        setPrice('');
        setStock('');
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

    const item = {
      ...product,
      quantity: Number(quantity),
      total: product.price * quantity
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
      <header className="app-header">
        <div>
          <p className="eyebrow">Enterprise Retail POS</p>
          <h1>BillFlow Enterprise</h1>
          <p className="intro-text">A polished billing dashboard for store teams. Manage products, track GST, and generate invoice-ready receipts with QR delivery.</p>
        </div>

        <div className="status-card">
          <span>Live products</span>
          <strong>{products.length}</strong>
          <p>Inventory and invoice creation in a professional workflow.</p>
        </div>
      </header>

      <div className="layout-columns">
        <section className="section">
          <div className="section-header">
            <div>
              <h2>Product catalog</h2>
              <p>Maintain pricing and stock with enterprise-grade clarity.</p>
            </div>
          </div>

          <div className="panel form-panel">
            <div className="card-title">Add new product</div>
            <div className="form-grid">
              <div className="field">
                <label>Product name</label>
                <input className="input-field" placeholder="e.g. Premium Apples" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="field">
                <label>Unit price</label>
                <input className="input-field" type="number" min="0" placeholder="₹0" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
              <div className="field">
                <label>Stock available</label>
                <input className="input-field" type="number" min="0" placeholder="0" value={stock} onChange={e => setStock(e.target.value)} />
              </div>
              <button type="button" className="button button-primary" onClick={addProduct}>Add product</button>
            </div>
          </div>

          <div className="panel product-panel">
            <div className="card-title">Catalog overview</div>
            <div className="product-table">
              <div className="table-row table-head">
                <span>Product</span>
                <span>Price</span>
                <span>Stock</span>
                <span>Action</span>
              </div>
              {products.length === 0 ? (
                <div className="table-row empty-state">No products available yet.</div>
              ) : (
                products.map(p => (
                  <div key={p.id} className="table-row">
                    <span>{p.name}</span>
                    <span>₹{p.price.toFixed(2)}</span>
                    <span>{p.stock}</span>
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
              <p>Build invoices quickly, with GST and payment mode tracking.</p>
            </div>
          </div>

          <div className="panel billing-panel">
            <div className="form-grid">
              <div className="field">
                <label>Item</label>
                <select className="input-field" onChange={e => setSelectedProduct(e.target.value)} value={selectedProduct}>
                  <option value="">Select product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — ₹{p.price.toFixed(2)}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Quantity</label>
                <input className="input-field" type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} />
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
                      <div className="item-meta">Qty {item.quantity}</div>
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
