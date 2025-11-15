const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Medicine = sequelize.define('Medicine', {
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 }
});

module.exports = Medicine;
