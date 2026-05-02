const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   TEST ROUTE
========================= */
app.get('/', (req, res) => {
  res.send('Backend running 🚀');
});

/* =========================
   ADD PRODUCT
========================= */
app.post('/products', (req, res) => {
  const { name, price, stock } = req.body;

  db.run(
    `INSERT INTO products (name, price, stock)
     VALUES (?, ?, ?)`,
    [name, price, stock],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).send('Error inserting product');
      }
      res.json({ id: this.lastID });
    }
  );
});

/* =========================
   GET PRODUCTS
========================= */
app.get('/products', (req, res) => {
  db.all(`SELECT * FROM products`, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching products');
    }
    res.json(rows);
  });
});

/* =========================
   DELETE PRODUCT
========================= */
app.delete('/products/:id', (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM products WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send('Error deleting product');
    }
    res.json({ deleted: this.changes });
  });
});

app.listen(3000, () => {
  console.log('Server running → http://localhost:3000');
});


/* =========================
   CREATE INVOICE
========================= */
app.post('/invoice', (req, res) => {
  const { cart, subTotal, gstAmount, total, paymentMode } = req.body;
  const date = new Date().toISOString();

  db.run(
    `INSERT INTO invoices (sub_total, gst_amount, total, payment_mode, date) VALUES (?, ?, ?, ?, ?)`,
    [subTotal, gstAmount, total, paymentMode, date],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).send("Error saving invoice");
      }

      const invoiceId = this.lastID;

      // Insert items
      cart.forEach(item => {
        db.run(
          `INSERT INTO invoice_items 
           (invoice_id, product_name, price, quantity, total)
           VALUES (?, ?, ?, ?, ?)`,
          [invoiceId, item.name, item.price, item.quantity, item.total]
        );
      });

      res.json({ message: "Invoice saved", invoiceId });
    }
  );
});


// =========================
// GET INVOICE DETAILS
// =========================
app.get('/invoice/:id', (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT * FROM invoices WHERE id = ?`,
    [id],
    (err, invoice) => {
      if (err) return res.status(500).send(err);

      db.all(
        `SELECT * FROM invoice_items WHERE invoice_id = ?`,
        [id],
        (err, items) => {
          if (err) return res.status(500).send(err);

          res.json({
            invoice,
            items
          });
        }
      );
    }
  );
});