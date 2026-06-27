# Tasks: Core Food Ordering System

**Input**: Design documents from `/specs/001-food-ordering-system/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL. Verification will be performed manually following the quickstart validation scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic configuration setup.

- [x] T001 Setup server configuration and ES Modules in `server/package.json`
- [x] T002 [P] Set up environment configuration files in `server/.env` and `client/.env`
- [x] T003 [P] Configure client-side proxying in `client/vite.config.js`
- [x] T004 Create admin and food items database seeding script in `server/seed.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database connections, schemas, error-handling, and base middlewares.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 Configure database connection setup using Mongoose in `server/index.js`
- [x] T006 [P] Create User schema model in `server/models/User.js`
- [x] T007 [P] Create FoodItem schema model in `server/models/FoodItem.js`
- [x] T008 [P] Create Order schema model in `server/models/Order.js`
- [x] T009 [P] Create Payment schema model in `server/models/Payment.js`
- [x] T010 [P] Create JWT validation and admin middleware check in `server/middleware/auth.js` and `server/middleware/adminGuard.js`
- [x] T011 Setup API router mounting and base error handler middleware in `server/index.js` and `server/middleware/error.js`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Customer Order Placement Flow (Priority: P1) 🎯 MVP

**Goal**: Implement food catalog retrieval, cart local state management, order creation, PayHere redirection parameter generation, and PayHere success notification webhook.

**Independent Test**: Complete mock payment flow via cURL simulation and confirm DB updates status to "Preparing" / "Paid" per quickstart.md.

- [x] T012 [US1] Implement customer food menu GET endpoint in `server/routes/items.js` and controller in `server/controllers/foodController.js`
- [x] T013 [US1] Implement customer order creation and order history GET endpoints in `server/routes/orders.js` and controller in `server/controllers/orderController.js`
- [x] T014 [US1] Implement PayHere Sandbox hash generation and notify webhook POST endpoints in `server/routes/payments.js` and controller in `server/controllers/paymentController.js`
- [x] T015 [P] [US1] Create local shopping cart state context in `client/src/context/CartContext.jsx`
- [ ] T016 [US1] Create customer menu catalog view page in `client/src/pages/customer/Menu.jsx`
- [ ] T017 [US1] Create cart summary and PayHere redirection checkout form page in `client/src/pages/customer/Cart.jsx`
- [ ] T018 [US1] Create order and payment confirmation page in `client/src/pages/customer/Confirmation.jsx`

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Admin Operations Panel (Priority: P2)

**Goal**: Implement dashboard list of orders, status update tools, and food catalog manager creation/edition forms.

**Independent Test**: Admin dashboard allows viewing and updating order statuses, which is reflected immediately in customer order histories.

- [x] T019 [US2] Implement admin items CRUD endpoints in `server/routes/items.js` and controller in `server/controllers/foodController.js`
- [x] T020 [US2] Implement admin orders dashboard management endpoints in `server/routes/orders.js` and controller in `server/controllers/orderController.js`
- [ ] T021 [US2] Create Admin dashboard order tracking interface page in `client/src/pages/admin/AdminDashboard.jsx`
- [ ] T022 [US2] Create Admin food catalog management and creation form page in `client/src/pages/admin/AdminItems.jsx`

**Checkpoint**: User Stories 1 and 2 are fully functional and integrated.

---

## Phase 5: User Story 3 - User Registration & Role-based Auth (Priority: P3)

**Goal**: Implement customer/admin login and registration, password encryption, JWT token issues, and front-end authentication guards.

**Independent Test**: Test unauthorized access blocks and route redirection guards.

- [x] T023 [US3] Implement user registration and login auth endpoints in `server/routes/auth.js` and controller in `server/controllers/authController.js`
- [x] T024 [US3] Create Authentication context state in `client/src/context/AuthContext.jsx`
- [x] T025 [US3] Create registration and login screen forms in `client/src/pages/Register.jsx` and `client/src/pages/Login.jsx`
- [x] T026 [P] [US3] Create routing security guards in `client/src/routes/PrivateRoute.jsx` and `client/src/routes/AdminRoute.jsx`
- [x] T027 [US3] Create layout header navbar component with role-based link conditional views in `client/src/components/Navbar.jsx`

**Checkpoint**: All user stories are independently functional with role guards.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: General styling cleanup, layout responsiveness adjustments, and final seeding runs.

- [ ] T028 Run the automated seed script to populate final deployment state in `server/seed.js`
- [ ] T029 [P] Conduct responsive layout optimization and CSS styling cleanup across all client pages in `client/src/index.css`
- [ ] T030 Execute quickstart validation scenarios to confirm integration flow using `specs/001-food-ordering-system/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - starts immediately.
- **Foundational (Phase 2)**: Depends on Setup completion. Blocks all user stories.
- **User Stories (Phases 3 to 5)**: All depend on Foundational completion.
- **Polish (Phase 6)**: Depends on all user stories being complete.

### Parallel Opportunities

- All setup tasks (T002, T003) can run in parallel.
- All foundational mongoose schema models (T006 to T009) can run in parallel.
- Local Cart context initialization (T015) can run in parallel with API endpoints.
- Route guards (T026) can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Launch models in parallel:
Task: "Create FoodItem schema model in server/models/FoodItem.js"
Task: "Create Order schema model in server/models/Order.js"
Task: "Create Payment schema model in server/models/Payment.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Customer Order Flow)
4. **STOP and VALIDATE**: Verify mock payment flow via webhook simulations.
