const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all
router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM orders');
  res.json(rows);
});

// GET by id
router.get('/:id', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

// POST with transaction
router.post('/', async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { customer_id, items } = req.body;

    await conn.beginTransaction();

    let total = 0;

    for (const item of items) {
      const [product] = await conn.query(
        'SELECT * FROM products WHERE id = ?',
        [item.product_id]
      );

      if (product.length === 0) throw new Error('Product not found');
      if (product[0].stock < item.quantity) throw new Error('Insufficient stock');

      total += product[0].price * item.quantity;
    }

    const [orderResult] = await conn.query(
      'INSERT INTO orders (customer_id, total, status) VALUES (?, ?, ?)',
      [customer_id, total, 'pending']
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      const [product] = await conn.query(
        'SELECT * FROM products WHERE id = ?',
        [item.product_id]
      );

      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, product[0].price]
      );

      await conn.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    await conn.commit();
    res.status(201).json({ message: 'Order created', order_id: orderId });

  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  const [result] = await db.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;