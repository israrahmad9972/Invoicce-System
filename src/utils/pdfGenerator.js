const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateInvoicePDF(invoice, patient, items) {
    const doc = new PDFDocument();
    const filePath = `./invoices/invoice-${invoice.id}.pdf`;
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.text(`Patient: ${patient.name}`);
    doc.text(`Date: ${invoice.date}`);
    doc.moveDown();

    items.forEach(item => {
        doc.text(`${item.Medicine.name} - ${item.quantity} x ${item.price} = ${item.quantity * item.price}`);
    });

    doc.moveDown();
    doc.text(`Total: ${invoice.totalAmount}`);
    doc.end();

    return filePath;
}

module.exports = generateInvoicePDF;
