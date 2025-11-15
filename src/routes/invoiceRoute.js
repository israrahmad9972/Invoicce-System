const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Create invoice and generate PDF
router.post('/create', invoiceController.createInvoiceAndPDF);

module.exports = router;
