const express = require('express');
const cors = require('cors');

const customersRoutes = require('../routes/customers');
const productsRoutes = require('../routes/products');
const ordersRoutes = require('../routes/orders');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ IMPORTANT: NO /api here (Vercel already adds it)
app.use('/customers', customersRoutes);
app.use('/products', productsRoutes);
app.use('/orders', ordersRoutes);

// Health check (optional but useful)
app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ✅ Export for Vercel (this is enough)
module.exports = app;

// ✅ Run locally only
if (process.env.NODE_ENV !== 'production') {
  const PORT = 3333;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}