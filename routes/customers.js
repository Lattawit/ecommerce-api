const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all
router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM customers');
  res.json(rows);
});

// GET by id
router.get('/:id', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

// POST
router.post('/', async (req, res) => {
  const { name, email } = req.body;
  const [result] = await db.query(
    'INSERT INTO customers (name, email) VALUES (?, ?)',
    [name, email]
  );
  res.status(201).json({ id: result.insertId, name, email });
});

// DELETE
router.delete('/:id', async (req, res) => {
  const [result] = await db.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;