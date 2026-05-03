const express = require('express');
const { dbGet, dbRun, dbAll } = require('../utils/sql');
const { validatePurchase, asyncHandler } = require('../middleware/validators');

const router = express.Router();

router.post(
  '/purchase',
  validatePurchase,
  asyncHandler(async (req, res) => {
    const { productId, vendor, quantity, unit, costPrice, reference } = req.body;
    const purchaseDate = new Date().toISOString();
    const product = await dbGet('SELECT * FROM products WHERE id = ?', [productId]);

    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }

    const updatedStock = parseFloat(((product.stock_quantity || 0) + quantity).toFixed(3));
    const purchaseUnit = unit || product.unit || 'pcs';

    await dbRun(
      'UPDATE products SET stock_quantity = ?, cost_price = ?, last_purchase_date = ? WHERE id = ?',
      [updatedStock, costPrice, purchaseDate, productId]
    );

    const insertResult = await dbRun(
      `INSERT INTO purchases (product_id, vendor, purchase_date, quantity, unit, cost_price, total_cost, reference)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [productId, vendor, purchaseDate, quantity, purchaseUnit, costPrice, parseFloat((quantity * costPrice).toFixed(2)), reference || null]
    );

    res.status(201).json({ purchaseId: insertResult.lastID });
  })
);

router.get(
  '/purchases',
  asyncHandler(async (req, res) => {
    const rows = await dbAll(
      `SELECT purchases.*, products.name AS product_name, products.brand AS product_brand
       FROM purchases
       LEFT JOIN products ON purchases.product_id = products.id
       ORDER BY purchases.purchase_date DESC`
    );
    res.json(rows);
  })
);

module.exports = router;
