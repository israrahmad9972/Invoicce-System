const express = require('express');
const { connectDB, sequelize } = require('./config/db');
const bodyParser = require('body-parser');

const medicineRoutes = require('./routes/medicineRoute');
const patientRoutes = require('./routes/patientRoute');
const invoiceRoutes = require('./routes/invoiceRoute');

const app = express();
app.use(bodyParser.json());

app.use('/api/medicines', medicineRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/invoices', invoiceRoutes);

connectDB();

sequelize.sync({ alter: true }).then(() => console.log('DB synced'));

app.listen(3000, () => console.log('Server running on port 3000'));
