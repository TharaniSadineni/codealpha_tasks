# 🛒 ShopNest - Professional Full-Stack E-Commerce Website

**ShopNest** is a modern, responsive, full-stack E-Commerce web application built for college assignments, internship submissions, and production-ready demonstrations.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Custom Design System with CSS Variables), Vanilla JavaScript (Modular ES6+)
- **Backend**: Node.js, Express.js REST API
- **Database**: MongoDB with Mongoose ODM (Includes automatic `mongodb-memory-server` fallback for local development)
- **Security & Authentication**: JSON Web Tokens (JWT) & `bcryptjs` password hashing

---

## 🔑 Demonstration Accounts (College / Development Only)

> [!NOTE]
> The following pre-seeded accounts are provided solely for evaluation and demonstration purposes:

- **Demo Admin Account**: `admin@shopnest.com` / Password: `admin123`
- **Demo Customer Account**: `user@shopnest.com` / Password: `user123`

---

## 💳 Payment Gateway & Sandbox Disclaimer

> [!IMPORTANT]
> All payment features on ShopNest (Credit/Debit Card, UPI Google Pay, PhonePe, Paytm, BHIM) operate in **Sandbox / Test Simulation Mode**.
> - Transactions are simulated for demonstration purposes.
> - **No real money is charged.**
> - Do NOT enter real credit card numbers or raw UPI PINs.

---

## 🔑 Password Reset Note

> [!NOTE]
> The password reset endpoint (`POST /api/auth/reset-password`) is built as a college demonstration feature allowing account password reset via email address. For commercial production deployment, this flow should be integrated with an email OTP service or OAuth provider.

---

## ⚙️ Environment Variables & Configuration

Before deploying or running in production, copy `.env.example` to `.env` and set your production environment variables:

```bash
cp .env.example .env
```

### Environment Variables Template (`.env.example`):
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shopnest
JWT_SECRET=your_production_jwt_secret_key_here
PORT=5000
NODE_ENV=production
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Development)
Create a `.env` file or rely on local defaults:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=dev_shopnest_jwt_secret_key_2026
```

### 3. Seed Database (Optional)
```bash
npm run seed
```

### 4. Start the Server
```bash
npm start
```

Open your browser and visit: **`http://localhost:5000`**

---

## 📁 Project Directory Structure

```
/shopnest
├── public/
│   ├── css/          # Main design system & admin styles
│   ├── js/           # Modular ES6+ frontend controllers (api.js, app.js, catalog.js, checkout.js, etc.)
│   ├── images/       # Brand logo, hero banner, category SVGs, UPI logos, product photos
│   ├── index.html    # Home page & catalog
│   ├── product.html  # Product details page
│   ├── cart.html     # Shopping cart page
│   ├── checkout.html # Shipping & checkout gateway
│   ├── login.html    # User authentication page
│   ├── orders.html   # Customer order history page
│   ├── account.html  # User dashboard
│   ├── admin.html    # Admin management portal
│   └── 404.html      # Custom 404 page
├── models/           # Mongoose schemas (User.js, Product.js, Order.js)
├── routes/           # Express REST API routes (auth.js, products.js, orders.js)
├── middleware/       # Middleware (auth.js, errorHandler.js)
├── .env.example      # Production environment variable template
├── .gitignore        # Git exclusion rules
├── seed.js           # Database seeder script
├── server.js         # Express server entry point
├── package.json
└── README.md
```
