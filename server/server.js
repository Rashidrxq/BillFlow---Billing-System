const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

function getProductColumns(callback) {
  db.all(`PRAGMA table_info(products)`, [], (err, rows) => {
    if (err) return callback(err);
    const columns = new Set(rows.map(row => row.name));
    callback(null, columns);
  });
}

function productColumnsToInsert(columns, name, brand, unit, costPrice, sellPrice, stockQuantity, lastPurchaseDate) {
  const cols = ['name', 'brand', 'unit', 'cost_price', 'sell_price', 'stock_quantity', 'last_purchase_date'];
  const values = [name, brand, unit, costPrice || 0, sellPrice || 0, stockQuantity || 0, lastPurchaseDate];

  if (columns.has('price')) {
    cols.push('price');
    values.push(sellPrice || 0);
  }
  if (columns.has('stock')) {
    cols.push('stock');
    values.push(stockQuantity || 0);
  }

  return { cols, values };
}

function buildProductSelect(columns) {
  const fields = [
    'id',
    'name',
    'brand',
    'unit',
    'COALESCE(cost_price, 0) AS cost_price',
    'COALESCE(sell_price, 0) AS sell_price',
    'COALESCE(stock_quantity, 0) AS stock_quantity',
    'last_purchase_date'
  ];

  if (columns.has('price')) {
    fields.push('COALESCE(price, 0) AS price');
  }
  if (columns.has('stock')) {
    fields.push('COALESCE(stock, 0) AS stock');
  }

  return fields.join(', ');
}

app.get('/', (req, res) => {
  res.send('Backend running 🚀');
});

app.post('/products', (req, res) => {
  const { name, brand, unit, costPrice, sellPrice, stockQuantity } = req.body;
  const createdAt = new Date().toISOString();

  getProductColumns((err, columns) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading product schema');
    }

    const insertData = productColumnsToInsert(
      columns,
      name,
      brand,
      unit || 'pcs',
      costPrice,
      sellPrice,
      stockQuantity,
      createdAt
    );

    const placeholders = insertData.cols.map(() => '?').join(', ');
    db.run(
      `INSERT INTO products (${insertData.cols.join(', ')}) VALUES (${placeholders})`,
      insertData.values,
      function (insertErr) {
        if (insertErr) {
          console.error(insertErr);
          return res.status(500).send('Error inserting product');
        }
        res.json({ id: this.lastID });
      }
    );
  });
});

app.get('/products', (req, res) => {
  getProductColumns((err, columns) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading product schema');
    }

    const selectFields = buildProductSelect(columns);
    db.all(`SELECT ${selectFields} FROM products`, [], (queryErr, rows) => {
      if (queryErr) {
        console.error(queryErr);
        return res.status(500).send('Error fetching products');
      }
      res.json(rows);
    });
  });
});

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

app.post('/purchase', (req, res) => {
  const { productId, vendor, quantity, unit, costPrice, reference } = req.body;
  const purchaseDate = new Date().toISOString();
  const totalCost = parseFloat((quantity * costPrice).toFixed(2));

  db.get(`SELECT * FROM products WHERE id = ?`, [productId], (err, product) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error looking up product');
    }
    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }

    const updatedStock = parseFloat(((product.stock_quantity || 0) + Number(quantity)).toFixed(3));
    const purchaseUnit = unit || product.unit || 'pcs';

    db.run(
      `UPDATE products SET stock_quantity = ?, cost_price = ?, last_purchase_date = ? WHERE id = ?`,
      [updatedStock, costPrice, purchaseDate, productId],
      function (updateErr) {
        if (updateErr) {
          console.error(updateErr);
          return res.status(500).send('Error updating stock');
        }

        db.run(
          `INSERT INTO purchases (product_id, vendor, purchase_date, quantity, unit, cost_price, total_cost, reference)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [productId, vendor, purchaseDate, quantity, purchaseUnit, costPrice, totalCost, reference || null],
          function (insertErr) {
            if (insertErr) {
              console.error(insertErr);
              return res.status(500).send('Error recording purchase');
            }
            res.json({ purchaseId: this.lastID });
          }
        );
      }
    );
  });
});

app.get('/purchases', (req, res) => {
  db.all(
    `SELECT purchases.*, products.name AS product_name, products.brand AS product_brand
     FROM purchases
     LEFT JOIN products ON purchases.product_id = products.id
     ORDER BY purchases.purchase_date DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error fetching purchases');
      }
      res.json(rows);
    }
  );
});

app.post('/invoice', (req, res) => {
  const { cart, subTotal, gstAmount, total, paymentMode } = req.body;
  const date = new Date().toISOString();

  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    db.run(
      `INSERT INTO invoices (sub_total, gst_amount, total, payment_mode, date) VALUES (?, ?, ?, ?, ?)`,
      [subTotal, gstAmount, total, paymentMode, date],
      function (err) {
        if (err) {
          console.error(err);
          db.run('ROLLBACK');
          return res.status(500).send('Error saving invoice');
        }

        const invoiceId = this.lastID;

        const processItem = (index) => {
          if (index >= cart.length) {
            db.run('COMMIT');
            return res.json({ message: 'Invoice saved', invoiceId });
          }

          const item = cart[index];
          const quantity = Number(item.quantity);

          db.get(`SELECT * FROM products WHERE id = ?`, [item.id], (itemErr, product) => {
            if (itemErr) {
              console.error(itemErr);
              db.run('ROLLBACK');
              return res.status(500).send('Error validating inventory');
            }
            if (!product) {
              db.run('ROLLBACK');
              return res.status(400).json({ error: `Product not found for item ${item.name}` });
            }
            if ((product.stock_quantity || 0) < quantity) {
              db.run('ROLLBACK');
              return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }

            const updatedStock = parseFloat(((product.stock_quantity || 0) - quantity).toFixed(3));

            db.run(
              `UPDATE products SET stock_quantity = ? WHERE id = ?`,
              [updatedStock, item.id],
              (updateErr) => {
                if (updateErr) {
                  console.error(updateErr);
                  db.run('ROLLBACK');
                  return res.status(500).send('Error updating stock');
                }

                db.run(
                  `INSERT INTO invoice_items (invoice_id, product_id, product_name, unit, price, cost_price, quantity, total)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                  [
                    invoiceId,
                    product.id,
                    product.name,
                    product.unit,
                    product.sell_price,
                    product.cost_price,
                    quantity,
                    item.total
                  ],
                  (insertErr) => {
                    if (insertErr) {
                      console.error(insertErr);
                      db.run('ROLLBACK');
                      return res.status(500).send('Error saving invoice item');
                    }
                    processItem(index + 1);
                  }
                );
              }
            );
          });
        };

        processItem(0);
      }
    );
  });
});

app.get('/invoice/:id', (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM invoices WHERE id = ?`, [id], (err, invoice) => {
    if (err) return res.status(500).send(err);

    db.all(`SELECT * FROM invoice_items WHERE invoice_id = ?`, [id], (err, items) => {
      if (err) return res.status(500).send(err);
      res.json({ invoice, items });
    });
  });
});

app.listen(3000, () => {
  console.log('Server running → http://localhost:3000');
});
