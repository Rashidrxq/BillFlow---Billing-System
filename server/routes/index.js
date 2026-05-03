const express = require('express');
const productsRouter = require('./products');
const purchasesRouter = require('./purchases');
const invoicesRouter = require('./invoices');

const router = express.Router();

router.use('/products', productsRouter);
router.use('/', purchasesRouter);
router.use('/', invoicesRouter);

module.exports = router;
