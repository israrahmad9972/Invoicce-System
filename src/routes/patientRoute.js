const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const upload = require('../middlewares/uploadCSV'); // CSV upload middleware

// 👉 Add single patient
router.post('/add', patientController.addPatient);

// 👉 Add multiple manually (JSON array)
router.post('/bulk-manual', patientController.bulkAddManual);

// 👉 Add multiple using CSV file
router.post('/bulk-csv', upload.single('file'), patientController.bulkAddFromCSV);

// 👉 Get all patients
router.get('/', patientController.getAllPatients);

// 👉 Get single patient by ID
router.get('/:id', patientController.getPatient);

// 👉 Update patient
router.put('/:id', patientController.updatePatient);

// 👉 Delete patient
router.delete('/:id', patientController.deletePatient);

module.exports = router;
