const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Patient = require('./patientModel');

const Invoice = sequelize.define('Invoice', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    totalAmount: { type: DataTypes.FLOAT, allowNull: false },
    invoiceDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

// Relation: Invoice → Patient
Invoice.belongsTo(Patient, { foreignKey: 'patientId' });
Patient.hasMany(Invoice, { foreignKey: 'patientId' });

module.exports = Invoice;
