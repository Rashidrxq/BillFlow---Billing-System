const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./shop.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sub_total REAL,
      gst_amount REAL,
      total REAL,
      payment_mode TEXT,
      date TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER,
      product_name TEXT,
      price REAL,
      quantity INTEGER,
      total REAL
    )
  `);

  db.run(`ALTER TABLE invoices ADD COLUMN sub_total REAL`, err => {});
  db.run(`ALTER TABLE invoices ADD COLUMN gst_amount REAL`, err => {});
  db.run(`ALTER TABLE invoices ADD COLUMN payment_mode TEXT`, err => {});
});

module.exports = db;
