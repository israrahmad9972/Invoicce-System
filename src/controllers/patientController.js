const Patient = require('../models/patientModel');
const fs = require('fs');
const csv = require('csv-parser');

// Add single patient
exports.addPatient = async (req, res) => {
    try {
        const { name, age, gender, phone, address } = req.body;

        const newPatient = await Patient.create({
            name,
            age,
            gender,
            phone,
            address
        });

        res.status(201).json({
            message: "Patient added successfully",
            data: newPatient
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Manual bulk add (JSON array)
exports.bulkAddManual = async (req, res) => {
    try {
        const { patients } = req.body; // expecting array of patients
        if (!Array.isArray(patients) || patients.length === 0)
            return res.status(400).json({ message: "Invalid patients array" });

        const newPatients = await Patient.bulkCreate(patients);
        res.status(201).json({
            message: "Patients added successfully",
            data: newPatients
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Bulk add from CSV
exports.bulkAddFromCSV = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "CSV file is required" });

        const results = [];
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                // Adjust fields if CSV headers are different
                const patients = results.map(p => ({
                    name: p.name,
                    age: p.age || null,
                    gender: p.gender || null,
                    phone: p.phone || null,
                    address: p.address || null
                }));

                const newPatients = await Patient.bulkCreate(patients);
                res.status(201).json({
                    message: "Patients added successfully from CSV",
                    data: newPatients
                });
            });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all patients
exports.getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.findAll();
        res.status(200).json(patients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get single patient by ID
exports.getPatient = async (req, res) => {
    try {
        const { id } = req.params;
        const patient = await Patient.findByPk(id);
        if (!patient) return res.status(404).json({ message: "Patient not found" });

        res.status(200).json(patient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update patient
exports.updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const patient = await Patient.findByPk(id);
        if (!patient) return res.status(404).json({ message: "Patient not found" });

        await patient.update(req.body);

        res.status(200).json({
            message: "Patient updated successfully",
            data: patient
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete patient
exports.deletePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const patient = await Patient.findByPk(id);
        if (!patient) return res.status(404).json({ message: "Patient not found" });

        await patient.destroy();
        res.status(200).json({ message: "Patient deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
