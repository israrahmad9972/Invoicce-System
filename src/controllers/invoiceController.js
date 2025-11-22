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
const doc = new PDFDocument({ margin: 40 });
const pdfDir = path.join(__dirname, '../pdfs');
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

const filePath = path.join(pdfDir, `invoice_${invoice.id}.pdf`);
doc.pipe(fs.createWriteStream(filePath));


// ========== HEADER SECTION ==========
const logoPath = path.join(__dirname, "../../assets/logo.jpg");

// Common Y for baseline
const headerY = 40;

// === LOGO (Left Side) ===
if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 40, headerY, { width: 80, height: 80 });
}

// === CLINIC TITLE (Center) ===
// Y slightly lower so that text appears vertically centered with logo
const titleY = headerY + 30;

doc.fontSize(22)
   .font('Helvetica-Bold')
   .text('Waleed Health Care Center', 0, titleY, { align: 'center' });


// === INVOICE DETAILS (Right Side) ===
const rightX = 450; 
const invoiceY = headerY + 25;

doc.fontSize(10);

// Invoice number
doc.text(`Invoice No: ${invoice.id}`, rightX, invoiceY, { align: 'left' });

// Date (sirf 12px neeche)
doc.text(`Date: ${invoice.invoiceDate.toDateString()}`, rightX, invoiceY + 12, { align: 'left' });


// Add spacing after header section
doc.moveDown(6);


// ========== PATIENT DETAILS BOX ==========
doc.roundedRect(40, doc.y, 520, 80, 8)
   .stroke();

let boxY = doc.y + 10;

doc.fontSize(12).font('Helvetica-Bold')
   .text(`Patient Information`, 50, boxY);

boxY += 20;

doc.fontSize(11).font('Helvetica')
doc.text(`Name: ${dbPatient.name}`, 50, boxY);

boxY += 20; // neeche shift
doc.text(`Phone: ${dbPatient.phone || 'N/A'}`, 50, boxY);

boxY += 20;

doc.text(`Address: ${dbPatient.address || 'N/A'}`, 50, boxY);

doc.moveDown(5);


// ========== MEDICINES TABLE ==========

const tableTop = doc.y;
const col1 = 50, col2 = 250, col3 = 350, col4 = 450;

// Header Background
doc.rect(col1 - 10, tableTop - 5, 480, 25).fill('#e6e6e6');
doc.fillColor('#000');

// Table Headings
doc.fontSize(11).font('Helvetica-Bold')
   .text('Medicine Name', col1, tableTop)
   .text('Qty', col2, tableTop)
   .text('Price', col3, tableTop)
   .text('Total', col4, tableTop);

doc.moveDown(1);

let y = tableTop + 20;

medicineRecords.forEach((m, i) => {
    // Alternate row background
    if (i % 2 === 0) {
        doc.rect(col1 - 10, y - 5, 480, 20).fill('#f8f8f8');
        doc.fillColor('#000');
    }

    doc.font('Helvetica').fontSize(10)
       .text(m.name, col1, y)
       .text(m.quantity, col2, y)
       .text(`Rs. ${m.price.toFixed(2)}`, col3, y)
       .text(`Rs. ${(m.price * m.quantity).toFixed(2)}`, col4, y);

    y += 22;
});

// Bottom line
doc.moveTo(40, y).lineTo(560, y).stroke();

y += 10;

// Total Amount
doc.fontSize(13).font('Helvetica-Bold')
   .text(`Total Amount: Rs. ${totalAmount.toFixed(2)}`, col4 - 20, y);

// ========== FOOTER ==========
doc.moveDown(4);
doc.fontSize(10).font('Helvetica-Oblique')
   .text('Thank you for visiting Waleed Health Care Center.', { align: 'center' })
   .text('For queries contact: 0312-0000000 | waleedclinic@gmail.com', { align: 'center' });

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
