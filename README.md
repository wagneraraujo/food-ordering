# 🍔 ByteBite - Modern Food Ordering System

ByteBite is a fully-featured, type-safe **Food Ordering System** built using a modern full-stack architecture. It features an interactive customer catalog, shopping cart, authentication, real-time administrative dashboards for order status tracking and menu management, and a complete checkout integration using the **PayHere Sandbox** payment gateway.

The entire codebase—both frontend and backend—has been fully migrated to **TypeScript** for robust compile-time checking and autocomplete support.

---

## 🚀 Features

### 👤 Customer Features
*   **Interactive Menu Catalog**: Browse food items grouped by categories (Pizzas, Burgers, Desserts, Beverages) with real-time price, category filters, and availability.
*   **Persistent Cart Management**: Add items to your cart, dynamically adjust quantities, view individual subtotals, and calculate real-time order totals.
*   **Checkout & PayHere Sandbox Redirect**: Securely generate payment keys and automatically redirect to the PayHere Sandbox portal to simulate transactions.
*   **Order History & Status Tracking**: View past orders and monitor active order states (e.g., *Received*, *Preparing*, *Out for Delivery*, *Delivered*).
*   **Auth Route Protection**: Secure views with layout-based redirect guards ensuring customers are authenticated.

### 🛡️ Admin Operations
*   **Order Management Dashboard**: Real-time view of all store orders with inline status transition controls (*Received* ➡️ *Preparing* ➡️ *Out for Delivery* ➡️ *Delivered*).
*   **Food Catalog Manager**: Comprehensive CRUD interface to add new food items, update existing details (price, description, availability), or delete discontinued items.
*   **Role-Based Access Control**: Strict middleware checking that blocks non-admin users from accessing dashboard endpoints or actions.

### ⚙️ Technical Details
*   **End-to-End Type Safety**: 100% TypeScript compile-time checks with zero loose types (`any`).
*   **Stateless JWT Security**: Passwords hashed with `bcryptjs` and session tokens handled via authorization headers.
*   **Secure Webhook Notification Verification**: Server-to-server webhook endpoint (`/api/payments/notify`) validating MD5 payment signatures sent by PayHere sandbox before updating order states.

---

## 🛠️ Tech Stack

*   **Frontend**: React 19, Vite 8, React Router 7, Axios, CSS Variables (responsive, modern visual design).
*   **Backend**: Node.js, Express, TypeScript (`tsx` compiler for on-the-fly execution).
*   **Database**: MongoDB, Mongoose (schemas fully validated with typed document interfaces).
*   **Payment Gateway**: PayHere Sandbox.

---

## 📁 Project Directory Structure

```text
food-ordering/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Common UI Components (Navbar, guards)
│   │   ├── context/            # Auth and Cart state management contexts
│   │   ├── pages/              # Menu, Cart, Confirmation, Login, Admin dashboards
│   │   ├── routes/             # Authentication routing guards
│   │   ├── App.tsx             # Main routing layout
│   │   └── main.tsx            # Frontend mounting entrypoint
│   ├── tsconfig.json           # Frontend TypeScript compiler settings
│   └── vite.config.ts          # Vite asset pipeline & proxying options
│
├── server/                     # Express Backend
│   ├── controllers/            # Request handlers (auth, food, order, payment)
│   ├── middleware/             # Role guards, validation, and error loggers
│   ├── models/                 # Strongly typed Mongoose database models
│   ├── routes/                 # Express REST endpoint maps
│   ├── types/                  # Global Express namespace type declarations
│   ├── seed.ts                 # Database seeding script (default catalog & admin account)
│   ├── index.ts                # Main Express server entrypoint
│   └── tsconfig.json           # Backend TypeScript compiler settings
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
Make sure you have the following installed locally:
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [MongoDB](https://www.mongodb.com/) (running on `mongodb://localhost:27017` or a MongoDB Atlas URI)

### 2. Configuration Settings (`.env`)

Create configuration files inside both the `server/` and `client/` directories:

#### Backend Environment (`server/.env`)
```ini
PORT=5000
MONGO_URI=mongodb://localhost:27017/food-ordering
JWT_SECRET=your_super_secure_jwt_key
PAYHERE_MERCHANT_ID=1230000                  # Replace with your sandbox merchant ID
PAYHERE_MERCHANT_SECRET=your_sandbox_secret  # Replace with your sandbox secret key
PAYHERE_SANDBOX=true
CLIENT_URL=http://localhost:5173
```

#### Frontend Environment (`client/.env`)
```ini
# Add any client specific keys if required. The client communicates with the server via the Vite dev proxy.
```

### 3. Setup Commands

#### Install Dependencies
Navigate into both directories and run the installation script:
```bash
# Install Server modules
cd server
npm install

# Install Client modules
cd ../client
npm install
```

#### Database Seeding
Populate your database with default menu items and administrative accounts by running:
```bash
cd ../server
npx tsx seed.ts
```
*   **Default Admin Account**: `admin@food.com` / `admin123`
*   **Default Customer Account**: `customer@food.com` / `customer123`

---

## 🏃 Running the Application

### Development Servers

Open two terminal sessions or run the commands:

#### Start the Backend (Port 5000)
```bash
cd server
npm run dev
```

#### Start the Frontend (Port 5173)
```bash
cd client
npm run dev
```

The application will be running at [http://localhost:5173/](http://localhost:5173/).

### Type-Checking & Verification
Validate that all files conform to strict TypeScript compiler guidelines:
```bash
# Typecheck backend
cd server
npx tsc --noEmit

# Typecheck frontend
cd client
npm run type-check
```

### Production Build
Build optimized production assets:
```bash
# Build backend to dist/
cd server
npm run build

# Build frontend to dist/
cd client
npm run build
```

---

## 💳 PayHere Integration & Sandbox Simulation

ByteBite utilizes the **PayHere Sandbox Checkout API** to handle payments securely:
1.  When a customer clicks **Proceed to Checkout**, a POST request is sent to `/api/payments/init` to generate PayHere signed parameter sets including calculated payment hashes using MD5 signature logic:
    ```text
    MD5(MerchantID + OrderID + AmountString + Currency + MD5(MerchantSecret))
    ```
2.  The client form dynamically auto-submits values to the sandbox endpoint: `https://sandbox.payhere.lk/pay/checkout`.
3.  Upon simulated payment completion, PayHere issues a server-to-server webhook callback to the backend `/api/payments/notify`.
4.  The server validates the notification's signature authenticity and changes the order status to `Preparing` (Paid).

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
