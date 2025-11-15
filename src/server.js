const express = require('express');
const { connectDB, sequelize } = require('./config/db');
const bodyParser = require('body-parser');
// const invoiceRoutes = require('./routes/invoiceRoutes');
// const medicineRoutes = require('./routes/medicineRoutes');
// const patientRoutes = require('./routes/patientRoutes');

const app = express();
app.use(bodyParser.json());

// app.use('/api/invoices', invoiceRoutes);
// app.use('/api/medicines', medicineRoutes);
// app.use('/api/patients', patientRoutes);

connectDB();

sequelize.sync({ alter: true }).then(() => console.log('DB synced'));

app.listen(5000, () => console.log('Server running on port 5000'));
