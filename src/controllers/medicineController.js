const fs = require("fs");
const csv = require("csv-parser");
const Medicine = require("../models/medicineModel");


// ------------------------------
// Add Single Medicine
// ------------------------------
exports.addMedicine = async (req, res) => {
    try {
        const { name, price, description, stock } = req.body;

        const newMed = await Medicine.create({
            name,
            price,
            description,
            stock: stock || 0
        });

        res.status(201).json({
            message: "Medicine added successfully",
            data: newMed,
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



// ------------------------------
// Manual Bulk Add (JSON Array)
// ------------------------------
exports.addBulkMedicine = async (req, res) => {
    try {
        const { medicines } = req.body;

        if (!medicines || !Array.isArray(medicines)) {
            return res.status(400).json({
                message: "Send medicines as an array"
            });
        }

        const newMeds = await Medicine.bulkCreate(medicines);

        res.status(201).json({
            message: "Bulk medicines added successfully",
            count: newMeds.length,
            data: newMeds
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



// ------------------------------
// CSV Upload Bulk Add
// ------------------------------
exports.importCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "CSV file is required"
            });
        }

        const medicines = [];

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on("data", (row) => {
                medicines.push({
                    name: row.name,
                    description: row.description,
                    price: row.price,
                    stock: row.stock || 0
                });
            })
            .on("end", async () => {
                try {
                    const added = await Medicine.bulkCreate(medicines);

                    fs.unlinkSync(req.file.path); // remove uploaded file

                    res.status(201).json({
                        message: "CSV imported successfully",
                        count: added.length,
                        data: added
                    });

                } catch (error) {
                    res.status(500).json({ error: error.message });
                }
            });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



// ------------------------------
// Get All Medicines
// ------------------------------
exports.getAllMedicine = async (req, res) => {
    try {
        const meds = await Medicine.findAll();
        res.status(200).json(meds);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



// ------------------------------
// Get Single Medicine
// ------------------------------
exports.getMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const med = await Medicine.findByPk(id);

        if (!med) return res.status(404).json({ message: "Medicine not found" });

        res.status(200).json(med);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



// ------------------------------
// Update Medicine
// ------------------------------
exports.updateMedicine = async (req, res) => {
    try {
        const { id } = req.params;

        const med = await Medicine.findByPk(id);
        if (!med) return res.status(404).json({ message: "Medicine not found" });

        await med.update(req.body);

        res.status(200).json({
            message: "Medicine updated successfully",
            data: med
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



// ------------------------------
// Delete Medicine
// ------------------------------
exports.deleteMedicine = async (req, res) => {
    try {
        const { id } = req.params;

        const med = await Medicine.findByPk(id);
        if (!med) return res.status(404).json({ message: "Medicine not found" });

        await med.destroy();

        res.status(200).json({ message: "Medicine deleted successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
