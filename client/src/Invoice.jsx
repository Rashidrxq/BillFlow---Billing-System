import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function Invoice() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const receiptRef = useRef(null);
  const GST_RATE = 0.18;

  useEffect(() => {
    fetch(`http://localhost:3000/invoice/${id}`)
      .then(res => res.json())
      .then(data => setData(data));
  }, [id]);

  const downloadPDF = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`receipt-${id}.pdf`);
  };

  if (!data) return <h2>Loading...</h2>;

  const invoice = data.invoice;
  const items = data.items;
  const subTotal = invoice.sub_total ?? items.reduce((sum, item) => sum + item.total, 0);
  const gstAmount = invoice.gst_amount ?? parseFloat((subTotal * GST_RATE).toFixed(2));
  const total = invoice.total ?? parseFloat((subTotal + gstAmount).toFixed(2));
  const paymentMode = invoice.payment_mode ?? 'Cash';
  const date = new Date(invoice.date).toLocaleString();
  const currentUrl = window.location.href;

  return (
    <div style={{ padding: 20, minHeight: '100vh', background: '#f4f4f8' }}>
      <div
        ref={receiptRef}
        style={{
          maxWidth: 760,
          margin: '0 auto',
          background: '#fff',
          padding: 28,
          borderRadius: 18,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
          color: '#1f2937',
          lineHeight: 1.5
        }}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, marginBottom: 30 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#2563eb', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 20 }}>
                B
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>BillFlow Market</div>
                <div style={{ color: '#6b7280', marginTop: 2 }}>Clean supermarket receipt</div>
              </div>
            </div>
            <div style={{ color: '#4b5563', fontSize: 14 }}>Thank you for shopping with us! Please keep this receipt for your records.</div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, letterSpacing: 1.2, textTransform: 'uppercase', color: '#6b7280' }}>Invoice</div>
            <div style={{ fontSize: 32, fontWeight: 700, marginTop: 6 }}>#{invoice.id}</div>
            <div style={{ marginTop: 4, color: '#6b7280' }}>{date}</div>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: '18px 20px', background: '#f9fafb', borderRadius: 14, marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Store</div>
            <div>BillFlow Supermarket</div>
            <div>123 Market Lane</div>
            <div>City Center, ZIP 400001</div>
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Payment</div>
            <div>{paymentMode}</div>
            <div style={{ marginTop: 14, fontSize: 14, fontWeight: 700, color: '#374151' }}>Scan to verify</div>
            <div style={{ color: '#6b7280', wordBreak: 'break-all' }}>{currentUrl}</div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 560, borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '16px 20px', background: '#f3f4f6', color: '#4b5563', fontSize: 14, fontWeight: 700 }}>
              <span>Item</span>
              <span>Price</span>
              <span>Qty</span>
              <span>Total</span>
            </div>
            {items.map(item => (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '16px 20px', borderTop: '1px solid #e5e7eb', fontSize: 14 }}>
                <span>{item.product_name}</span>
                <span>₹{item.price.toFixed(2)}</span>
                <span>{item.quantity}</span>
                <span>₹{item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginTop: 28, alignItems: 'flex-end' }}>
          <div style={{ minWidth: 220, background: '#f9fafb', borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Receipt details</div>
            <div style={{ display: 'grid', gap: 8, color: '#374151' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><strong>₹{subTotal.toFixed(2)}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>GST ({(GST_RATE * 100).toFixed(0)}%)</span><strong>₹{gstAmount.toFixed(2)}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 18, fontWeight: 700 }}><span>Total</span><strong>₹{total.toFixed(2)}</strong></div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 260, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Receipt note</div>
            <div style={{ color: '#6b7280', fontSize: 14 }}>This bill includes applicable GST. Keep this receipt for returns or warranty. Visit us again!</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={downloadPDF} style={{ padding: '12px 22px', borderRadius: 12, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>
          Download PDF
        </button>
        <button onClick={() => window.print()} style={{ padding: '12px 22px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', cursor: 'pointer' }}>
          Print Receipt
        </button>
      </div>
    </div>
  );
}

export default Invoice;
