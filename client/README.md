# 🧾 Smart Shop POS System (QR-Based E-Billing)

A full-stack Point of Sale (POS) system designed for local shops with offline-first billing and QR-based digital receipts.

---

## 🚀 Features

- 📦 Product Management (Add / Delete)
- 🧾 Billing System (Cart + Total Calculation)
- 💾 Invoice Storage (SQLite Database)
- 📱 QR Code Generation for E-Bill
- 🌐 Invoice Page (Customer View)
- 🖨 Printable Receipt UI
- 🎨 Branded Bill Design

---

## 🧠 System Architecture

Frontend → React (Vite)  
Backend → Node.js + Express  
Database → SQLite  
QR → qrcode.react  

---

## ⚙️ How It Works

1. Shopkeeper creates bill (offline)
2. Invoice stored in database
3. QR code generated with invoice link
4. Customer scans QR → sees digital bill

---

## 🖥️ Tech Stack

- React.js
- Node.js
- Express.js
- SQLite
- QR Code Generator

---

## ▶️ Run Locally

### Backend
```bash
cd server
npm install
node server.js



---

# 📸 3. Add Screenshots (IMPORTANT)

Take screenshots of:
- Product page
- Billing page
- QR code
- Invoice UI

Upload to repo:
```md
![Billing UI](./screenshots/billing.png)