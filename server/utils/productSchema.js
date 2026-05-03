const { dbAll } = require('./sql');

async function getProductColumns() {
  const rows = await dbAll('PRAGMA table_info(products)');
  return new Set(rows.map(row => row.name));
}

function productColumnsToInsert(columns, product) {
  const cols = ['name', 'brand', 'unit', 'cost_price', 'sell_price', 'stock_quantity', 'last_purchase_date'];
  const values = [
    product.name,
    product.brand || null,
    product.unit || 'pcs',
    product.costPrice ?? 0,
    product.sellPrice ?? 0,
    product.stockQuantity ?? 0,
    product.lastPurchaseDate,
  ];

  if (columns.has('price')) {
    cols.push('price');
    values.push(product.sellPrice ?? 0);
  }
  if (columns.has('stock')) {
    cols.push('stock');
    values.push(product.stockQuantity ?? 0);
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
    'last_purchase_date',
  ];

  if (columns.has('price')) {
    fields.push('COALESCE(price, 0) AS price');
  }
  if (columns.has('stock')) {
    fields.push('COALESCE(stock, 0) AS stock');
  }

  return fields.join(', ');
}

module.exports = {
  getProductColumns,
  productColumnsToInsert,
  buildProductSelect,
};
