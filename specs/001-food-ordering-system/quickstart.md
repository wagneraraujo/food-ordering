# Quickstart Validation Guide: Food Ordering System

This guide outlines runnable scenarios to verify that the core food ordering flow, administrative operations, and payment gateway webhooks function correctly.

## Prerequisites

1. **MongoDB Connection**: Ensure `MONGO_URI` in `server/.env` points to a running instance (local or MongoDB Atlas).
2. **Environment Configuration**: Create and fill the required `.env` file in the `server` directory using the values from `server/.env.local`.
3. **Database Seeding**: Initialize test admin accounts and default food items by running:
   ```bash
   cd server
   node seed.js
   ```

---

## Scenario 1: Customer Authentication & Registration

Verify user registration and authentication logic.

1. **Start the API server**:
   ```bash
   cd server
   npm run dev
   ```
2. **Register a customer account**:
   Send a `POST` request to `/api/auth/register` (using cURL or Postman):
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"testpassword","phone":"+94770000000"}'
   ```
   **Expected Outcome**: Response contains status `201 Created` with a JWT token and user role set to `customer`.

3. **Login with registered details**:
   Send a `POST` request to `/api/auth/login`:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpassword"}'
   ```
   **Expected Outcome**: Response contains status `200 OK` with a valid JWT token.

---

## Scenario 2: Food Menu Browsing

Verify that registered customers can retrieve the food catalog.

1. **Get Menu Catalog**:
   Send a `GET` request to `/api/items`:
   ```bash
   curl -X GET http://localhost:5000/api/items
   ```
   **Expected Outcome**: Response contains status `200 OK` and lists seeded menu items (e.g. Margherita, Cheeseburger, Cake).

---

## Scenario 3: Order Creation & Payment Initiation

Verify checkout generation and hash signature calculations.

1. **Create Order**:
   Retrieve the `_id` of a food item from the menu, and create an order (replace `TOKEN` with token from registration, and `FOOD_ITEM_ID` with real ID):
   ```bash
   curl -X POST http://localhost:5000/api/orders \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"items":[{"item":"FOOD_ITEM_ID","quantity":2}]}'
   ```
   **Expected Outcome**: Response contains status `201 Created` returning the generated order containing status `Pending`, `paymentStatus` set to `Unpaid`, and a unique `orderId`.

2. **Initiate Payment Checkout**:
   Send a `POST` request to `/api/payments/init` (replace `ORDER_DB_ID` with the database `_id` returned in order creation):
   ```bash
   curl -X POST http://localhost:5000/api/payments/init \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"orderId":"ORDER_DB_ID"}'
   ```
   **Expected Outcome**: Response contains status `200 OK` returning PayHere parameters, including the computed `hash` string corresponding to local PayHere merchant parameters.

---

## Scenario 4: Webhook Notification & Fulfill

Simulate the server-to-server transaction success notification webhook from PayHere.

1. **Simulate Webhook Notification**:
   Compute or use the MD5 validation mechanism to submit notification details. Send a POST request to `/api/payments/notify`. Note that the signature `md5sig` must match:
   `MD5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + MD5(merchant_secret))`
   *(For verification in sandbox mode, you can calculate the hash manually using the secrets from your local config)*:
   ```bash
   curl -X POST http://localhost:5000/api/payments/notify \
     -H "Content-Type: application/json" \
     -d '{"merchant_id":"1230000","order_id":"ORD-ID-HERE","payment_id":"PAY-112233","payhere_amount":"TOTAL-AMOUNT","payhere_currency":"LKR","status_code":"2","md5sig":"CALCULATED-MD5-SIGNATURE"}'
   ```
   **Expected Outcome**: Webhook returns status `200 OK` (signature validated). Querying the order status (e.g. GET `/api/orders/my-orders`) shows status transitioned to `Preparing` and paymentStatus updated to `Paid`.

---

## Scenario 5: Admin Panel & Order Status Update

Verify administrative protection and management capabilities.

1. **Attempt Admin Access as Customer**:
   Send a request to the general orders route `/api/orders` as a customer user:
   ```bash
   curl -X GET http://localhost:5000/api/orders \
     -H "Authorization: Bearer CUSTOMER_TOKEN"
   ```
   **Expected Outcome**: Response returns status `403 Forbidden` or `401 Unauthorized` block.

2. **Access Admin Panel**:
   Login as Admin using the default seed (`admin@food.com` / `admin123`) to obtain an `ADMIN_TOKEN`.
   Send a request to `/api/orders` using the `ADMIN_TOKEN`:
   ```bash
   curl -X GET http://localhost:5000/api/orders \
     -H "Authorization: Bearer ADMIN_TOKEN"
   ```
   **Expected Outcome**: Returns status `200 OK` listing all active orders in the database.

3. **Update Order Status**:
   Update an active order status (replace `ORDER_DB_ID` with the database order `_id`):
   ```bash
   curl -X PUT http://localhost:5000/api/orders/ORDER_DB_ID/status \
     -H "Authorization: Bearer ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"status":"Ready"}'
   ```
   **Expected Outcome**: Returns status `200 OK` with order status field updated to `Ready`.
