const Invoice = require('../models/invoiceModel');
const Patient = require('../models/patientModel');
const Medicine = require('../models/medicineModel');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.createInvoiceAndPDF = async (req, res) => {
    try {
        const { patient, medicines } = req.body;

        // 1️⃣ Check if patient exists, else create
        let dbPatient = await Patient.findOne({ where: { name: patient.name, phone: patient.phone } });
        if (!dbPatient) {
            dbPatient = await Patient.create(patient);
        }

        // 2️⃣ Check medicines, create if not exists
        const medicineRecords = [];
        let totalAmount = 0;

        for (let med of medicines) {
            let dbMed = await Medicine.findOne({ where: { name: med.name } });
            if (!dbMed) {
                dbMed = await Medicine.create({
                    name: med.name,
                    price: med.price,
                    description: med.description || '',
                    stock: med.quantity || 0
                });
            }
            totalAmount += (dbMed.price * (med.quantity || 1));
            medicineRecords.push({ ...dbMed.dataValues, quantity: med.quantity || 1 });
        }

        // 3️⃣ Create invoice
        const invoice = await Invoice.create({
            totalAmount,
            patientId: dbPatient.id
        });

        // 4️⃣ Generate PDF
        const doc = new PDFDocument({ margin: 50 });
        const pdfDir = path.join(__dirname, '../pdfs');
        if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

        const filePath = path.join(pdfDir, `invoice_${invoice.id}.pdf`);
        doc.pipe(fs.createWriteStream(filePath));

        // ===== Header =====
        const logoPath = path.join(__dirname, '../assets/logo.png'); // replace with your logo path if any
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 45, { width: 50 });
        }

        doc.fontSize(20).text('Doctor Waleed Pharmacy', 0, 50, { align: 'center' });
        doc.fontSize(10).text(`Invoice Date: ${invoice.invoiceDate.toDateString()}`, 0, 50, { align: 'right' });

        doc.moveDown(2);

        // ===== Patient Info =====
        doc.fontSize(12).text(`Invoice ID: ${invoice.id}`);
        doc.text(`Patient Name: ${dbPatient.name}`);
        doc.text(`Phone: ${dbPatient.phone || 'N/A'}`);
        doc.text(`Address: ${dbPatient.address || 'N/A'}`);
        doc.moveDown();

        // ===== Medicines Table =====
        doc.fontSize(12).text('Medicines', { underline: true });
        const tableTop = doc.y + 10;
        const itemX = 50, qtyX = 250, priceX = 300, totalX = 400;

        doc.fontSize(10);
        doc.text('Name', itemX, tableTop);
        doc.text('Qty', qtyX, tableTop);
        doc.text('Price', priceX, tableTop);
        doc.text('Total', totalX, tableTop);

        let y = tableTop + 20;
        medicineRecords.forEach(m => {
            doc.text(m.name, itemX, y);
            doc.text(m.quantity, qtyX, y);
            doc.text(`$${m.price.toFixed(2)}`, priceX, y);
            doc.text(`$${(m.price*m.quantity).toFixed(2)}`, totalX, y);
            y += 20;
        });

        doc.moveTo(50, y).lineTo(550, y).stroke(); // horizontal line
        y += 10;
        doc.fontSize(12).text(`Total Amount: $${totalAmount.toFixed(2)}`, totalX, y, { bold: true });

        doc.end();

        res.status(200).json({
            message: 'Invoice created & PDF generated successfully',
            invoiceId: invoice.id,
            pdfPath: filePath
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
