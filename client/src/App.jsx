import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ShoppingCart, ArrowRight, Package, CreditCard, History } from 'lucide-react';
import Invoice from './Invoice';
import { createInvoice, createProduct, getProducts, recordPurchase, removeProduct } from './api';
import TopNav from './components/TopNav';
import StorySection from './components/StorySection';
import './App.css';

const GST_RATE = 0.18;

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
  const [invoiceId, setInvoiceId] = useState(null);
  const [purchaseProductId, setPurchaseProductId] = useState('');
  const [purchaseVendor, setPurchaseVendor] = useState('');
  const [purchaseQuantity, setPurchaseQuantity] = useState('0');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [purchaseReference, setPurchaseReference] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const units = ['pcs', 'kg', 'g', 'ltr', 'box'];

  const clearFeedback = () => setFeedback({ type: '', message: '' });
  const showError = (message) => setFeedback({ type: 'error', message });
  const showSuccess = (message) => setFeedback({ type: 'success', message });

  const parseNumberField = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  };

  const subTotal = useMemo(() => cart.reduce((sum, item) => sum + item.total, 0), [cart]);
  const gstAmount = useMemo(() => parseFloat((subTotal * GST_RATE).toFixed(2)), [subTotal]);
  const totalWithTax = useMemo(() => parseFloat((subTotal + gstAmount).toFixed(2)), [subTotal, gstAmount]);
  const invoiceURL = invoiceId ? `${window.location.origin}/invoice/${invoiceId}` : '';

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const items = await getProducts();
      setProducts(items);
    } catch (err) {
      showError('Unable to load catalog.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async () => {
    const cost = parseNumberField(costPrice);
    const sell = parseNumberField(sellPrice);
    const stock = parseNumberField(stockQuantity);

    if (!name) return showError('Product name is required.');
    
    setIsSaving(true);
    try {
      await createProduct({
        name: name.trim(),
        brand: brand.trim() || null,
        unit,
        costPrice: cost,
        sellPrice: sell,
        stockQuantity: stock,
      });
      setName('');
      setBrand('');
      setCostPrice('');
      setSellPrice('');
      showSuccess('Item added to catalog.');
      await fetchProducts();
    } catch (err) {
      showError('Error adding product.');
    } finally {
      setIsSaving(false);
    }
  };

  const addToCart = () => {
    const product = products.find((p) => p.id === Number(selectedProduct));
    if (!product) return showError('Select a product.');
    
    const item = {
      id: product.id,
      name: product.name,
      unit: product.unit || 'pcs',
      quantity: Number(quantity),
      price: Number(product.sell_price ?? 0),
      total: parseFloat((Number(product.sell_price ?? 0) * quantity).toFixed(2)),
    };

    setCart([...cart, item]);
    showSuccess('Added to cart.');
  };

  const generateBill = async () => {
    if (cart.length === 0) return showError('Cart is empty.');
    setIsSaving(true);
    try {
      const data = await createInvoice({
        cart,
        subTotal,
        gstAmount,
        total: totalWithTax,
        paymentMode,
      });
      setInvoiceId(data?.invoiceId ?? null);
      setCart([]);
      showSuccess('Invoice generated.');
    } catch (err) {
      showError('Error generating invoice.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="app-shell">
      <TopNav />
      
      {/* SECTION 1: HERO */}
      <StorySection 
        id="hero"
        eyebrow="BillFlow Elite"
        title={<>Billing, <span className="italic">Refined.</span></>}
        subtitle="A premium storytelling experience for store management. Manage your catalog, track inventory, and generate GST-ready invoices with unmatched elegance."
      >
        <div className="scroll-indicator">
          <div className="scroll-line"></div>
          <span className="italic">Scroll to explore</span>
        </div>
      </StorySection>

      {/* SECTION 2: CATALOG */}
      <StorySection 
        id="products"
        eyebrow="The Catalog"
        title="Curate your Inventory"
        subtitle="Every product tells a story. Add and manage your boutique's offerings with precision."
      >
        <div className="layout-split">
          <div className="form-panel-premium">
            <div className="field">
              <label>Product Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="e.g. Vintage Leather Jacket" />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Cost Price</label>
                <input value={costPrice} onChange={e => setCostPrice(e.target.value)} className="input-field" placeholder="0.00" />
              </div>
              <div className="field">
                <label>Sell Price</label>
                <input value={sellPrice} onChange={e => setSellPrice(e.target.value)} className="input-field" placeholder="0.00" />
              </div>
            </div>
            <button onClick={addProduct} className="button" disabled={isSaving}>
              {isSaving ? 'Registering...' : 'Add to Collection'}
            </button>
          </div>

          <div className="list-panel-premium">
            <div className="premium-list">
              {products.map(p => (
                <div key={p.id} className="premium-list-item">
                  <div className="item-main">
                    {p.name} <span className="item-meta">— {p.brand || 'Unbranded'}</span>
                  </div>
                  <div className="item-price">
                    ${p.sell_price} <span className="italic">{p.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </StorySection>

      {/* SECTION 3: BILLING */}
      <StorySection 
        id="billing"
        eyebrow="The Transaction"
        title="Finalize the Sale"
        subtitle="Create polished, GST-ready invoices that reflect your brand's commitment to quality."
      >
        <div className="billing-experience">
          <div className="cart-builder">
            <div className="field">
              <label>Select Product</label>
              <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="input-field">
                <option value="">Choose an item...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <button onClick={addToCart} className="button">Add to Invoice</button>
          </div>

          <div className="invoice-preview-card">
            <div className="cart-items">
              {cart.map((item, i) => (
                <div key={i} className="cart-item-premium">
                  <span>{item.name} x {item.quantity}</span>
                  <span className="italic">${item.total}</span>
                </div>
              ))}
            </div>
            <div className="invoice-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>${subTotal}</span>
              </div>
              <div className="total-row large">
                <span>Total <span className="italic">(inc. GST)</span></span>
                <span>${totalWithTax}</span>
              </div>
            </div>
            <button onClick={generateBill} className="button-block-premium button" disabled={isSaving}>
              {isSaving ? 'Processing...' : 'Complete Transaction'}
            </button>
            {invoiceURL && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="invoice-link">
                <a href={invoiceURL} target="_blank" className="button-link">View Generated Invoice</a>
              </motion.div>
            )}
          </div>
        </div>
      </StorySection>

      {/* FEEDBACK OVERLAY */}
      <AnimatePresence>
        {feedback.message && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`feedback-toast ${feedback.type}`}
            onClick={clearFeedback}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>
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
