const express = require('express');
const { dbAll, dbGet, dbRun } = require('../utils/sql');
const { validateInvoice, validateIdParam, asyncHandler } = require('../middleware/validators');

const router = express.Router();

router.post(
  '/invoice',
  validateInvoice,
  asyncHandler(async (req, res) => {
    const { cart, subTotal, gstAmount, total, paymentMode } = req.body;
    const date = new Date().toISOString();

    await dbRun('BEGIN TRANSACTION');

    try {
      const invoiceResult = await dbRun(
        'INSERT INTO invoices (sub_total, gst_amount, total, payment_mode, date) VALUES (?, ?, ?, ?, ?)',
        [subTotal, gstAmount, total, paymentMode, date]
      );

      const invoiceId = invoiceResult.lastID;

      for (const item of cart) {
        const quantity = Number(item.quantity);
        const product = await dbGet('SELECT * FROM products WHERE id = ?', [item.id]);

        if (!product) {
          await dbRun('ROLLBACK');
          return res.status(400).json({ error: `Product not found for item ${item.name || item.id}` });
        }

        if ((product.stock_quantity || 0) < quantity) {
          await dbRun('ROLLBACK');
          return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
        }

        const updatedStock = parseFloat(((product.stock_quantity || 0) - quantity).toFixed(3));

        await dbRun('UPDATE products SET stock_quantity = ? WHERE id = ?', [updatedStock, item.id]);

        await dbRun(
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
            item.total,
          ]
        );
      }

      await dbRun('COMMIT');
      res.status(201).json({ message: 'Invoice saved', invoiceId });
    } catch (err) {
      await dbRun('ROLLBACK');
      throw err;
    }
  })
);

router.get(
  '/invoice/:id',
  validateIdParam,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const invoice = await dbGet('SELECT * FROM invoices WHERE id = ?', [id]);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const items = await dbAll('SELECT * FROM invoice_items WHERE invoice_id = ?', [id]);
    res.json({ invoice, items });
  })
);

module.exports = router;
