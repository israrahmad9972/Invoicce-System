const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const upload = require('../middlewares/uploadCSV'); // CSV upload middleware

// 👉 Add single medicine
router.post('/add', medicineController.addMedicine);

// 👉 Add multiple manually (JSON array)
router.post('/bulk-manual', medicineController.addBulkMedicine);

// 👉 Add multiple using CSV File
router.post('/bulk-csv', upload.single('file'), medicineController.importCSV);

// 👉 Get all medicines
router.get('/', medicineController.getAllMedicine);

// 👉 Get single medicine by ID
router.get('/:id', medicineController.getMedicine);

// 👉 Update medicine
router.put('/:id', medicineController.updateMedicine);

// 👉 Delete medicine
router.delete('/:id', medicineController.deleteMedicine);

module.exports = router;
