# API Interface Contracts: Food Ordering System

All backend routes are prefixed with `/api`. Protected routes require the JWT token to be provided in the `Authorization` header as `Bearer <token>`.

---

## 1. Authentication Endpoints

### POST `/api/auth/register` (Public)
Registers a new customer.

- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123",
    "phone": "+94771234567"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "60c72b2f9b1d8a23a4f1d3a5",
      "name": "Jane Doe",
      "role": "customer"
    }
  }
  ```

### POST `/api/auth/login` (Public)
Authenticates customer or administrator.

- **Request Body**:
  ```json
  {
    "email": "admin@food.com",
    "password": "admin123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "60c72b2f9b1d8a23a4f1d3a1",
      "name": "Master Admin",
      "role": "admin"
    }
  }
  ```

---

## 2. Food Item Endpoints

### GET `/api/items` (Public)
Retrieves the menu catalog.

- **Success Response (200 OK)**:
  ```json
  [
    {
      "_id": "60c72b2f9b1d8a23a4f1d301",
      "name": "Margherita Pizza",
      "description": "Classic pizza with tomato sauce and mozzarella",
      "price": 1200,
      "category": "Pizza",
      "image": "https://example.com/margherita.jpg",
      "available": true
    }
  ]
  ```

### POST `/api/items` (Admin Only)
Creates a new menu item.

- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "Cheeseburger",
    "description": "Beef burger with cheese and lettuce",
    "price": 950,
    "category": "Burger",
    "image": "https://example.com/burger.jpg"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "_id": "60c72b2f9b1d8a23a4f1d302",
    "name": "Cheeseburger",
    "description": "Beef burger with cheese and lettuce",
    "price": 950,
    "category": "Burger",
    "image": "https://example.com/burger.jpg",
    "available": true
  }
  ```

### PUT `/api/items/:id` (Admin Only)
Modifies an existing menu item.

- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "price": 1000,
    "available": false
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "_id": "60c72b2f9b1d8a23a4f1d302",
    "name": "Cheeseburger",
    "description": "Beef burger with cheese and lettuce",
    "price": 1000,
    "category": "Burger",
    "image": "https://example.com/burger.jpg",
    "available": false
  }
  ```

### DELETE `/api/items/:id` (Admin Only)
Deletes a menu item.

- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Item deleted successfully"
  }
  ```

---

## 3. Order Endpoints

### POST `/api/orders` (Customer Only)
Creates a new pending order from the customer's cart.

- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "items": [
      {
        "item": "60c72b2f9b1d8a23a4f1d301",
        "quantity": 2
      }
    ]
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "_id": "60c72b2f9b1d8a23a4f1d3b0",
    "customer": "60c72b2f9b1d8a23a4f1d3a5",
    "items": [
      {
        "item": "60c72b2f9b1d8a23a4f1d301",
        "name": "Margherita Pizza",
        "price": 1200,
        "quantity": 2
      }
    ],
    "total": 2400,
    "status": "Pending",
    "paymentStatus": "Unpaid",
    "orderId": "ORD-172183492812"
  }
  ```

### GET `/api/orders/my-orders` (Customer Only)
Retrieves the logged-in customer's order history.

- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
  ```json
  [
    {
      "_id": "60c72b2f9b1d8a23a4f1d3b0",
      "items": [...],
      "total": 2400,
      "status": "Preparing",
      "paymentStatus": "Paid",
      "orderId": "ORD-172183492812",
      "createdAt": "2026-06-27T09:00:00.000Z"
    }
  ]
  ```

### GET `/api/orders` (Admin Only)
Retrieves all orders in the system.

- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
  ```json
  [
    {
      "_id": "60c72b2f9b1d8a23a4f1d3b0",
      "customer": {
        "_id": "60c72b2f9b1d8a23a4f1d3a5",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "items": [...],
      "total": 2400,
      "status": "Preparing",
      "paymentStatus": "Paid",
      "orderId": "ORD-172183492812"
    }
  ]
  ```

### PUT `/api/orders/:id/status` (Admin Only)
Updates an order status.

- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "status": "Ready"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "_id": "60c72b2f9b1d8a23a4f1d3b0",
    "status": "Ready",
    "paymentStatus": "Paid"
  }
  ```

---

## 4. Payment Endpoints

### POST `/api/payments/init` (Customer Only)
Calculates hashes and outputs full redirect form parameters required by the PayHere Sandbox.

- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "orderId": "60c72b2f9b1d8a23a4f1d3b0"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "merchant_id": "1230000",
    "return_url": "http://localhost:5173/confirmation",
    "cancel_url": "http://localhost:5173/cart",
    "notify_url": "https://your-domain.ngrok-free.app/api/payments/notify",
    "order_id": "ORD-172183492812",
    "items": "Margherita Pizza",
    "amount": "2400.00",
    "currency": "LKR",
    "hash": "D8F4E23C0A1950F83E7D3F12A0987BC6",
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@example.com",
    "phone": "+94771234567",
    "address": "N/A",
    "city": "N/A",
    "country": "Sri Lanka"
  }
  ```

### POST `/api/payments/notify` (Public Webhook)
Called by the PayHere checkout gateway dynamically as a server-to-server webhook request.

- **Request Body**:
  ```json
  {
    "merchant_id": "1230000",
    "order_id": "ORD-172183492812",
    "payment_id": "320025983210",
    "payhere_amount": "2400.00",
    "payhere_currency": "LKR",
    "status_code": "2",
    "md5sig": "C092837EF98D0A1C2E34F56A7890BC1E",
    "custom_1": "",
    "custom_2": ""
  }
  ```
- **Response**:
  - `200 OK` if the local hash matches `md5sig`, the order exists, and status updates successfully.
  - `400 Bad Request` if signature validation (`localHash === md5sig`) fails.
  - `404 Not Found` if order referenced by `order_id` is missing.
