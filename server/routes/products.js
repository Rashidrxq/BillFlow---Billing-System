const express = require('express');
const { getProductColumns, productColumnsToInsert, buildProductSelect } = require('../utils/productSchema');
const { dbAll, dbRun } = require('../utils/sql');
const { validateProduct, validateIdParam, asyncHandler } = require('../middleware/validators');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const columns = await getProductColumns();
    const selectFields = buildProductSelect(columns);
    const rows = await dbAll(`SELECT ${selectFields} FROM products`);
    res.json(rows);
  })
);

router.post(
  '/',
  validateProduct,
  asyncHandler(async (req, res) => {
    const { name, brand, unit, costPrice, sellPrice, stockQuantity } = req.body;
    const createdAt = new Date().toISOString();
    const columns = await getProductColumns();
    const insertData = productColumnsToInsert(columns, {
      name,
      brand,
      unit,
      costPrice,
      sellPrice,
      stockQuantity,
      lastPurchaseDate: createdAt,
    });

    const placeholders = insertData.cols.map(() => '?').join(', ');
    const result = await dbRun(
      `INSERT INTO products (${insertData.cols.join(', ')}) VALUES (${placeholders})`,
      insertData.values
    );
    res.status(201).json({ id: result.lastID });
  })
);

router.delete(
  '/:id',
  validateIdParam,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await dbRun('DELETE FROM products WHERE id = ?', [id]);
    res.json({ deleted: result.changes });
  })
);

module.exports = router;
