const Invoice = require('../models/Invoice');
const InvoiceItem = require('../models/InvoiceItem');
const Patient = require('../models/Patient');
const Medicine = require('../models/medicineModel');
const generateInvoicePDF = require('../utils/pdfGenerator');

async function createInvoice(req, res) {
    try {
        const { patientId, items } = req.body;
        const patient = await Patient.findByPk(patientId);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        let total = 0;
        const invoice = await Invoice.create({ patientId, totalAmount: 0 });

        for (const item of items) {
            const medicine = await Medicine.findByPk(item.medicineId);
            if (!medicine) continue;

            await InvoiceItem.create({
                invoiceId: invoice.id,
                medicineId: medicine.id,
                quantity: item.quantity,
                price: medicine.price
            });

            total += item.quantity * medicine.price;
        }

        invoice.totalAmount = total;
        await invoice.save();

        const invoicePDF = generateInvoicePDF(invoice, patient, await InvoiceItem.findAll({ where: { invoiceId: invoice.id }, include: Medicine }));

        res.json({ message: 'Invoice created', invoicePDF });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
}

module.exports = { createInvoice };
