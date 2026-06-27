# Feature Specification: TypeScript Migration

**Feature Branch**: `002-typescript-migration`

**Created**: 2026-06-27

**Status**: Draft

**Input**: User description: "ajuste para usar typescript em todo o projeto"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Type-Safe Local Development Experience (Priority: P1)

Developers working on the application can run the codebase with automated type checking, type safety warnings, and autocompletion in their editors, preventing runtime errors during development.

**Why this priority**: Type safety prevents common developer bugs (like typos, null pointer exceptions, and incorrect parameters) before code is even executed or deployed.

**Independent Test**: Running the compiler/linter on both client and server codebases and verifying that zero compile-time type errors are reported, and that type auto-completion/validation is active for all entities and routes.

**Acceptance Scenarios**:

1. **Given** a developer is writing new code or modifying existing code, **When** they attempt to pass invalid parameters to database models or helper functions, **Then** the compiler/editor MUST show immediate type-check errors.
2. **Given** a developer starts the local development servers, **When** they edit any code file, **Then** the hot-reloading mechanism MUST verify typescript compilation and log any compile/type errors to the terminal console.

---

### User Story 2 - Zero Regression Client Flow (Priority: P2)

Customers can access the food menu catalog, add items to the cart, checkout, complete the payment redirect via PayHere Sandbox, and receive a confirmation screen without any deviation or regressions in visual behavior, page transition, or functionality.

**Why this priority**: The TypeScript migration must be completely transparent to customers. It should not break the user experience or existing payment flows.

**Independent Test**: Complete the customer flow end-to-end (selecting food, checking out, simulated sandbox payment, and checking the confirmation details) and verify it works identically to the original JavaScript implementation.

**Acceptance Scenarios**:

1. **Given** a customer checks out, **When** the typescript client compiles, **Then** the client application MUST render the checkout screens and handle PayHere redirect and local cart updates without runtime console exceptions.

---

### User Story 3 - Zero Regression Admin Control (Priority: P3)

Administrators can log in, access the order tracking system, update order statuses, and modify the food catalog, with the application enforcing the same role-based authorization constraints.

**Why this priority**: Ensures the system remains secure and administrative controls function perfectly under TypeScript.

**Independent Test**: Log in with administrator credentials, update order status, add/edit/delete a food item, and verify that all operations are processed securely.

**Acceptance Scenarios**:

1. **Given** an admin accesses the dashboard, **When** they update an order's status, **Then** the backend TypeScript server MUST validate their role, authenticate the request, update the MongoDB database, and return the updated order.

---

### Edge Cases

- **Strict Type Validation on MongoDB Payloads**: MongoDB data retrieved via Mongoose must conform strictly to typed interfaces, so undefined properties or casting errors do not crash server routing.
- **PayHere Signature Mismatch on Typed Objects**: Ensure the calculated hash functions convert numeric prices and quantities properly to string types before invoking MD5 checks to avoid type-mismatch signatures.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The entire codebase (both client and server) MUST compile and run strictly under TypeScript without fallback to loose types (`any` should be minimized or disallowed where possible).
- **FR-002**: The server development server MUST compile TypeScript files on the fly and hot-reload.
- **FR-003**: The client development server MUST run Vite with TypeScript support, verifying types on builds.
- **FR-004**: All existing mongoose models and routing middleware MUST have explicit TypeScript type definitions and interfaces.
- **FR-005**: The application MUST build successfully into production bundles without any type-checking failures.

### Key Entities *(include if feature involves data)*

- **Typed User Model**: Extends mongoose Document with typed fields (name, email, password, phone, role).
- **Typed FoodItem Model**: Extends mongoose Document with typed fields (name, description, price, category, image, available).
- **Typed Order Model**: Extends mongoose Document with typed sub-documents and status validations.
- **Typed Payment Model**: Extends mongoose Document with gateway parameters.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The type-checking command (`tsc` or `npm run type-check`) compiles 100% of codebase files with zero errors.
- **SC-002**: The client and server build commands produce optimized production build artifacts without any compilation errors.
- **SC-003**: 100% of existing user-facing features work identically to the previous JavaScript version with zero functional changes or regressions.

## Assumptions

- Developers have TypeScript-supporting code editors.
- The runtime environment (Node.js) runs the compiled JS files produced by TypeScript or uses a runtime execution engine like `tsx` or `ts-node` for local dev.
