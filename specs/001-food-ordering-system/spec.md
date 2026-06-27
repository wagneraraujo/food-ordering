# Feature Specification: Core Food Ordering System

**Feature Branch**: `001-food-ordering-system`

**Created**: 2026-06-27

**Status**: Draft

**Input**: User description: "Full-stack food ordering system with Customer and Admin panels, JWT authentication, and PayHere Sandbox payment integration."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Customer Order Placement Flow (Priority: P1)

A registered customer logs in, browses the menu of food items, adds items to their shopping cart, goes to the checkout page, fills/verifies their details, clicks to pay, completes the mock transaction via the PayHere Sandbox gateway, and gets redirected to an order confirmation screen showing their paid order details.

**Why this priority**: This is the core end-to-end user transaction that defines the entire purpose of the food ordering application.

**Independent Test**: Fully testable by registering a test customer account, selecting items, submitting the PayHere Sandbox mock payment flow, and verifying redirection back to `/confirmation` showing the updated order status as "Paid".

**Acceptance Scenarios**:

1. **Given** a logged-in customer has items in their shopping cart, **When** they click "Place Order", **Then** the system MUST initialize the payment on the backend, generate parameters and the secure MD5 hash signature, and redirect the browser to the PayHere Sandbox checkout page with the correct inputs.
2. **Given** the customer is on the PayHere Sandbox checkout page, **When** they fill in test card details and submit the form successfully, **Then** PayHere MUST perform a HTTP POST notify_url callback to the backend, the backend MUST validate the signature, set the order status to "Preparing", set the payment status to "Paid", and the customer MUST be redirected back to the `/confirmation` page displaying their active order and payment status.

---

### User Story 2 - Admin Operations Panel (Priority: P2)

An administrator logs in, accesses a dedicated dashboard displaying all system orders, modifies the status of active orders (e.g. from "Preparing" to "Ready" or "Delivered"), and manages the food items catalog (creating, editing, and deleting items).

**Why this priority**: Essential for business users to fulfill orders and manage the menu catalog.

**Independent Test**: Log in as an admin user, navigate to the admin routes, update an active order's status, and verify that the customer's interface shows the status update. Also verify that adding/editing food items updates the menu catalog instantly.

**Acceptance Scenarios**:

1. **Given** an admin is logged into the admin panel, **When** they view the orders list and select "Ready" for a pending order, **Then** the database order status MUST be updated to "Ready" and the corresponding customer's order history MUST reflect this change.
2. **Given** an admin is logged into the admin panel, **When** they add a new food item with name, description, category, price, and image URL, **Then** the new item MUST immediately be saved to the database and become visible on the customer menu.

---

### User Story 3 - User Registration & Role-based Auth (Priority: P3)

A new user registers with a name, email, password, and phone number, and logs in using their credentials. The application restricts access to customer features and admin controls using their assigned role.

**Why this priority**: Secures access to user-specific dashboards and restricts administrative operations.

**Independent Test**: Register a customer account and attempt to access `/admin` paths to verify redirect behavior, then login with admin seed credentials to verify dashboard access.

**Acceptance Scenarios**:

1. **Given** a visitor fills out the registration form, **When** they submit the form, **Then** the system MUST encrypt their password using bcryptjs, create a user record in the database with the default role of "customer", generate a JWT token, and log them in automatically.
2. **Given** a user is logged in as a "customer", **When** they attempt to directly navigate to `/admin/orders` or any admin dashboard route, **Then** the system MUST block the request and redirect them to the home/menu page.

---

### Edge Cases

- **Webhook Failure**: If the PayHere notify webhook fails or is delayed, the order payment status MUST remain "Unpaid". The client confirmation page should gracefully check status and offer refreshing.
- **MD5 Signature Mismatch**: If an unauthorized party tries to spoof the PayHere webhook with fake notification parameters, the MD5 signature hash validation MUST fail, the backend MUST respond with HTTP 400 Bad Request, and no order status updates MUST occur.
- **Price Mismatch during Checkout**: If a food item's price changes in the backend after the customer adds it to their cart but before they check out, the system MUST compute the final order total based on the current database prices at the moment of order generation, not client-cached cart values.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST authenticate users using stateless JWT tokens, which MUST be passed in the `Authorization: Bearer <token>` header for protected backend APIs and verified on the server.
- **FR-002**: The server MUST hash passwords using bcryptjs with a salt round of 10 before saving to the database.
- **FR-003**: The backend MUST generate MD5 hashes incorporating `merchant_id`, `order_id`, `payhere_amount`, `payhere_currency`, and `merchant_secret` to secure checkout requests and validate webhook notifications.
- **FR-004**: Order statuses MUST transition through: Pending -> Preparing -> Ready -> Delivered -> Cancelled.
- **FR-005**: The system MUST restrict administrative endpoints and frontend routes (`AdminRoute`) to users with the `admin` role.

### Key Entities *(include if feature involves data)*

- **User**: Represents registered customers and administrators. Attributes: name, email, encrypted password, phone, role (customer/admin).
- **FoodItem**: Represents menu items available for order. Attributes: name, description, price, category (Pizza, Burger, Cake, Drink, Other), image, availability flag.
- **Order**: Represents a purchase request. Attributes: customer reference, array of items (ref FoodItem, snapshot of name/price/qty), total amount, orderStatus, paymentStatus, unique orderId string.
- **Payment**: Represents transaction records. Attributes: order reference, gateway transaction ID, status code, amount, currency, raw payload data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Customers can complete registration, select items, and be redirected to payment in under 90 seconds.
- **SC-002**: The payment notification webhook processes signatures and updates order status in under 1 second from PayHere redirect.
- **SC-003**: The system prevents any unauthorized customer from accessing administrative routes or backend endpoints (100% of invalid attempts blocked).

## Assumptions

- Visitors have a modern browser with JavaScript and LocalStorage enabled.
- The PayHere Sandbox environment is online and accessible during testing.
- Database access uses MongoDB Atlas free tier with Mongoose ODM.
