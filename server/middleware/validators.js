const { dbGet } = require('../utils/sql');

function sendValidationError(res, message) {
  return res.status(400).json({ error: message });
}

function isPositiveNumber(value) {
  return typeof value === 'number' && !Number.isNaN(value) && value >= 0;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateProduct(req, res, next) {
  const { name, brand, unit, costPrice, sellPrice, stockQuantity } = req.body;

  if (!isNonEmptyString(name)) {
    return sendValidationError(res, 'Product name is required');
  }
  if (brand != null && typeof brand !== 'string') {
    return sendValidationError(res, 'Product brand must be a string');
  }
  if (unit != null && typeof unit !== 'string') {
    return sendValidationError(res, 'Product unit must be a string');
  }
  if (costPrice != null && !isPositiveNumber(costPrice)) {
    return sendValidationError(res, 'Cost price must be a non-negative number');
  }
  if (sellPrice != null && !isPositiveNumber(sellPrice)) {
    return sendValidationError(res, 'Sell price must be a non-negative number');
  }
  if (stockQuantity != null && !isPositiveNumber(stockQuantity)) {
    return sendValidationError(res, 'Stock quantity must be a non-negative number');
  }

  req.body.costPrice = costPrice ?? 0;
  req.body.sellPrice = sellPrice ?? 0;
  req.body.stockQuantity = stockQuantity ?? 0;
  next();
}

function validateIdParam(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return sendValidationError(res, 'Invalid id parameter');
  }
  next();
}

async function validatePurchase(req, res, next) {
  const { productId, vendor, quantity, unit, costPrice, reference } = req.body;

  if (!Number.isInteger(productId) || productId <= 0) {
    return sendValidationError(res, 'Product ID must be a positive integer');
  }
  if (!isNonEmptyString(vendor)) {
    return sendValidationError(res, 'Vendor is required');
  }
  if (!isPositiveNumber(quantity) || quantity <= 0) {
    return sendValidationError(res, 'Quantity must be a positive number');
  }
  if (!isPositiveNumber(costPrice)) {
    return sendValidationError(res, 'Cost price must be a non-negative number');
  }
  if (unit != null && typeof unit !== 'string') {
    return sendValidationError(res, 'Unit must be a string');
  }
  if (reference != null && typeof reference !== 'string') {
    return sendValidationError(res, 'Reference must be a string');
  }

  req.body.quantity = Number(quantity);
  req.body.costPrice = Number(costPrice);
  next();
}

function validateInvoice(req, res, next) {
  const { cart, subTotal, gstAmount, total, paymentMode } = req.body;

  if (!Array.isArray(cart) || cart.length === 0) {
    return sendValidationError(res, 'Invoice cart must contain at least one item');
  }
  if (!isPositiveNumber(subTotal)) {
    return sendValidationError(res, 'Invoice subTotal must be a non-negative number');
  }
  if (!isPositiveNumber(gstAmount)) {
    return sendValidationError(res, 'GST amount must be a non-negative number');
  }
  if (!isPositiveNumber(total)) {
    return sendValidationError(res, 'Invoice total must be a non-negative number');
  }
  if (!isNonEmptyString(paymentMode)) {
    return sendValidationError(res, 'Payment mode is required');
  }

  for (const item of cart) {
    if (!Number.isInteger(item.id) || item.id <= 0) {
      return sendValidationError(res, 'Cart item id must be a positive integer');
    }
    if (!isPositiveNumber(item.quantity) || item.quantity <= 0) {
      return sendValidationError(res, `Quantity is required for item ${item.name || item.id}`);
    }
    if (!isPositiveNumber(item.total)) {
      return sendValidationError(res, `Total is required for item ${item.name || item.id}`);
    }
  }

  next();
}

function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

async function validateProductExists(req, res, next) {
  const productId = Number(req.body.productId || req.params.id);
  if (!productId) {
    return validateIdParam(req, res, next);
  }

  const product = await dbGet('SELECT id FROM products WHERE id = ?', [productId]);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  next();
}

module.exports = {
  validateProduct,
  validatePurchase,
  validateInvoice,
  validateIdParam,
  validateProductExists,
  asyncHandler,
};
