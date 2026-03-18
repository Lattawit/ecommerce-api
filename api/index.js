const express = require('express');
const cors = require('cors');

const customersRoutes = require('../routes/customers');
const productsRoutes = require('../routes/products');
const ordersRoutes = require('../routes/orders');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/customers', customersRoutes);
app.use('/products', productsRoutes);
app.use('/orders', ordersRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 👇 IMPORTANT: export as handler
module.exports = (req, res) => {
  return app(req, res);
};