# Tasks: TypeScript Migration

**Input**: Design documents from `/specs/002-typescript-migration/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: None requested. Testing is performed via automated compiler checking `tsc --noEmit` and manual verification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `server/`, `client/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [P] Configure server typescript package dependencies in server/package.json
- [ ] T002 Configure server typescript compiler settings in server/tsconfig.json
- [ ] T003 [P] Configure client typescript package dependencies in client/package.json
- [ ] T004 Configure client typescript compiler settings in client/tsconfig.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 [P] Create custom Express Request types in server/types/express.d.ts
- [ ] T006 [P] Define User interface and migrate model in server/models/User.ts
- [ ] T007 [P] Define FoodItem interface and migrate model in server/models/FoodItem.ts
- [ ] T008 [P] Define Order interface and migrate model in server/models/Order.ts
- [ ] T009 [P] Define Payment interface and migrate model in server/models/Payment.ts
- [ ] T010 [P] Migrate auth middleware in server/middleware/auth.ts
- [ ] T011 [P] Migrate adminGuard middleware in server/middleware/adminGuard.ts
- [ ] T012 [P] Migrate error middleware in server/middleware/error.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Type-Safe Local Development Experience (Priority: P1) 🎯 MVP

**Goal**: Developers working on the application can run the codebase with automated type checking, type safety warnings, and autocompletion in their editors, preventing runtime errors during development.

**Independent Test**: Run `npx tsc --noEmit` on both server/ and client/ to check for zero errors, and verify the backend dev server starts and hot-reloads with tsx.

### Implementation for User Story 1

- [ ] T013 [US1] Migrate authController in server/controllers/authController.ts
- [ ] T014 [US1] Migrate authRoutes in server/routes/authRoutes.ts
- [ ] T015 [US1] Migrate foodController in server/controllers/foodController.ts
- [ ] T016 [US1] Migrate foodRoutes in server/routes/foodRoutes.ts
- [ ] T017 [US1] Migrate paymentController in server/controllers/paymentController.ts
- [ ] T018 [US1] Migrate paymentRoutes in server/routes/paymentRoutes.ts
- [ ] T019 [US1] Migrate orderController in server/controllers/orderController.ts
- [ ] T020 [US1] Migrate orderRoutes in server/routes/orderRoutes.ts
- [ ] T021 [US1] Migrate main backend entry point in server/index.ts
- [ ] T022 [US1] Migrate database seed script in server/seed.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Zero Regression Client Flow (Priority: P2)

**Goal**: Customers can access the food menu catalog, add items to the cart, checkout, complete the payment redirect via PayHere Sandbox, and receive a confirmation screen without any deviation or regressions in visual behavior, page transition, or functionality.

**Independent Test**: Compile and run the client dev server, browse the menu, add items to the cart, log in, checkout, and complete simulated checkout payment successfully.

### Implementation for User Story 2

- [ ] T023 [P] [US2] Configure Vite to use typescript in client/vite.config.ts
- [ ] T024 [P] [US2] Update script reference in client/index.html
- [ ] T025 [P] [US2] Migrate main client entry point in client/src/main.tsx
- [ ] T026 [P] [US2] Migrate AuthContext in client/src/context/AuthContext.tsx
- [ ] T027 [P] [US2] Migrate CartContext in client/src/context/CartContext.tsx
- [ ] T028 [P] [US2] Migrate PrivateRoute in client/src/routes/PrivateRoute.tsx
- [ ] T029 [P] [US2] Migrate Navbar component in client/src/components/Navbar.tsx
- [ ] T030 [US2] Migrate Login and Register pages in client/src/pages/Login.tsx and client/src/pages/Register.tsx
- [ ] T031 [US2] Migrate Menu and Cart pages in client/src/pages/customer/Menu.tsx and client/src/pages/customer/Cart.tsx
- [ ] T032 [US2] Migrate Confirmation and OrderHistory pages in client/src/pages/customer/Confirmation.tsx and client/src/pages/customer/OrderHistory.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Zero Regression Admin Control (Priority: P3)

**Goal**: Administrators can log in, access the order tracking system, update order statuses, and modify the food catalog, with the application enforcing the same role-based authorization constraints.

**Independent Test**: Log in as admin, check Dashboard list, click Order status transitions, create/edit food items.

### Implementation for User Story 3

- [ ] T033 [P] [US3] Migrate AdminRoute in client/src/routes/AdminRoute.tsx
- [ ] T034 [US3] Migrate AdminDashboard in client/src/pages/admin/AdminDashboard.tsx
- [ ] T035 [US3] Migrate AdminItems in client/src/pages/admin/AdminItems.tsx
- [ ] T036 [US3] Migrate App routes component in client/src/App.tsx

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, production builds, and final verification

- [ ] T037 Delete all old JavaScript source files (`.js`, `.jsx`) replaced by TS/TSX files
- [ ] T038 Verify project using quickstart.md validation instructions
- [ ] T039 Build production bundle for server using npm run build in server/
- [ ] T040 Build production bundle for client using npm run build in client/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories.
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable.
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable.

### Within Each User Story

- Models before services.
- Services before endpoints.
- Core implementation before integration.
- Story complete before moving to next priority.

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel.
- All Foundational tasks marked [P] can run in parallel (within Phase 2).
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows).
- Models within a story marked [P] can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Launch all models for User Story 1 together:
Task: "Define User interface and migrate model in server/models/User.ts"
Task: "Define FoodItem interface and migrate model in server/models/FoodItem.ts"
Task: "Define Order interface and migrate model in server/models/Order.ts"
Task: "Define Payment interface and migrate model in server/models/Payment.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories
