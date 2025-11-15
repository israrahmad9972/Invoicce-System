const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Invoice = require('./Invoice');
const Medicine = require('./Medicine');

const InvoiceItem = sequelize.define('InvoiceItem', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    totalPrice: { type: DataTypes.FLOAT, allowNull: false }
});

// Relations
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId' });
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId' });

InvoiceItem.belongsTo(Medicine, { foreignKey: 'medicineId' });
Medicine.hasMany(InvoiceItem, { foreignKey: 'medicineId' });

module.exports = InvoiceItem;
