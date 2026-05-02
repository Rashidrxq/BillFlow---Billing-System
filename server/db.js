const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./shop.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT,
      unit TEXT NOT NULL DEFAULT 'pcs',
      cost_price REAL NOT NULL DEFAULT 0,
      sell_price REAL NOT NULL DEFAULT 0,
      stock_quantity REAL NOT NULL DEFAULT 0,
      last_purchase_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      vendor TEXT,
      purchase_date TEXT,
      quantity REAL NOT NULL DEFAULT 0,
      unit TEXT NOT NULL,
      cost_price REAL NOT NULL DEFAULT 0,
      total_cost REAL NOT NULL DEFAULT 0,
      reference TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sub_total REAL NOT NULL DEFAULT 0,
      gst_amount REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      payment_mode TEXT,
      date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER,
      product_id INTEGER,
      product_name TEXT,
      unit TEXT,
      price REAL,
      cost_price REAL,
      quantity REAL,
      total REAL,
      FOREIGN KEY(invoice_id) REFERENCES invoices(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    )
  `);

  db.run(`ALTER TABLE products ADD COLUMN brand TEXT`, err => {});
  db.run(`ALTER TABLE products ADD COLUMN unit TEXT`, err => {});
  db.run(`ALTER TABLE products ADD COLUMN cost_price REAL`, err => {});
  db.run(`ALTER TABLE products ADD COLUMN sell_price REAL`, err => {});
  db.run(`ALTER TABLE products ADD COLUMN stock_quantity REAL`, err => {});
  db.run(`ALTER TABLE products ADD COLUMN last_purchase_date TEXT`, err => {});
  db.run(`ALTER TABLE products ADD COLUMN created_at TEXT`, err => {});
  db.run(`ALTER TABLE purchases ADD COLUMN vendor TEXT`, err => {});
  db.run(`ALTER TABLE purchases ADD COLUMN purchase_date TEXT`, err => {});
  db.run(`ALTER TABLE purchases ADD COLUMN quantity REAL`, err => {});
  db.run(`ALTER TABLE purchases ADD COLUMN unit TEXT`, err => {});
  db.run(`ALTER TABLE purchases ADD COLUMN cost_price REAL`, err => {});
  db.run(`ALTER TABLE purchases ADD COLUMN total_cost REAL`, err => {});
  db.run(`ALTER TABLE purchases ADD COLUMN reference TEXT`, err => {});
  db.run(`ALTER TABLE invoices ADD COLUMN sub_total REAL`, err => {});
  db.run(`ALTER TABLE invoices ADD COLUMN gst_amount REAL`, err => {});
  db.run(`ALTER TABLE invoices ADD COLUMN payment_mode TEXT`, err => {});
  db.run(`ALTER TABLE invoice_items ADD COLUMN product_id INTEGER`, err => {});
  db.run(`ALTER TABLE invoice_items ADD COLUMN unit TEXT`, err => {});
  db.run(`ALTER TABLE invoice_items ADD COLUMN cost_price REAL`, err => {});
});

module.exports = db;
