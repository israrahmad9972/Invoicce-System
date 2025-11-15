const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../data/doctor.sqlite'),
    logging: false
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('SQLite Connected...');
    } catch (err) {
        console.error('Unable to connect to DB:', err);
    }
};

module.exports = { sequelize, connectDB };
