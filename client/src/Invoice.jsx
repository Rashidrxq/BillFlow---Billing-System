import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Printer } from 'lucide-react';

const GST_RATE = 0.18;

function Invoice() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const receiptRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/invoice/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Invoice ${id} not found`);
        return res.json();
      })
      .then((payload) => setData(payload))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const downloadPDF = async () => {
    if (!receiptRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`billflow-invoice-${id}.pdf`);
    } catch (err) {
      setError('Unable to export PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <div className="invoice-loading">The document is being prepared...</div>;
  if (error) return <div className="invoice-loading">{error}</div>;

  const { invoice, items } = data;
  const subTotal = invoice.sub_total ?? items.reduce((sum, i) => sum + i.total, 0);
  const gstAmount = invoice.gst_amount ?? (subTotal * GST_RATE);
  const total = invoice.total ?? (subTotal + gstAmount);
  const date = new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="premium-invoice-container">
      <nav className="invoice-nav">
        <a href="/" className="button-link"><ArrowLeft size={16} /> Back to Experience</a>
        <div className="invoice-actions">
          <button className="button-link" onClick={downloadPDF} disabled={isExporting}>
            <Download size={16} /> {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
          <button className="button-link" onClick={() => window.print()}>
            <Printer size={16} /> Print
          </button>
        </div>
      </nav>

      <motion.div 
        className="premium-invoice" 
        ref={receiptRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <header className="invoice-head">
          <div className="brand">
            <span className="logo">BILLFLOW</span>
            <p>Refined Store Management</p>
          </div>
          <div className="invoice-meta">
            <span className="eyebrow">Document No.</span>
            <p>#{invoice.id}</p>
            <span className="eyebrow">Date</span>
            <p>{date}</p>
          </div>
        </header>

        <div className="invoice-bill-to">
          <span className="eyebrow">Transaction Type</span>
          <p>{invoice.payment_mode} Payment</p>
        </div>

        <div className="invoice-items-list">
          <div className="item-row header">
            <span>Description</span>
            <span>Qty</span>
            <span>Amount</span>
          </div>
          {items.map((item) => (
            <div key={item.id} className="item-row">
              <span className="name">{item.product_name}</span>
              <span className="qty">{item.quantity}</span>
              <span className="total">${item.total.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <footer className="invoice-foot">
          <div className="totals">
            <div className="total-line">
              <span>Subtotal</span>
              <span>${subTotal.toFixed(2)}</span>
            </div>
            <div className="total-line">
              <span>GST (18%)</span>
              <span>${gstAmount.toFixed(2)}</span>
            </div>
            <div className="total-line grand">
              <span>Total Amount Due</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <div className="note">
            <p className="italic">Thank you for choosing BillFlow. This is a GST compliant digital document.</p>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}

export default Invoice;
