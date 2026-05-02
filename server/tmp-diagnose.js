const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./shop.db');

db.serialize(() => {
  console.log('PRAGMA table_info(products):');
  db.all('PRAGMA table_info(products)', [], (err, rows) => {
    console.log('err', err);
    console.log('rows', rows);
    db.run(
      'INSERT INTO products (name, brand, unit, cost_price, sell_price, stock_quantity, last_purchase_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['Direct Test', 'T', 'pcs', 10, 15, 5, new Date().toISOString(), new Date().toISOString()],
      function (insertErr) {
        console.log('insertErr', insertErr);
        db.close();
      }
    );
  });
});
