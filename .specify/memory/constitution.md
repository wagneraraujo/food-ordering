<!--
Sync Impact Report
- Version change: null -> 1.0.0
- List of modified principles: None (initial ratification)
- Added sections: Core Principles, Technology Stack and Environment Configuration, Quality Gates and Deployment Checklist, Governance
- Removed sections: None
- Templates requiring updates:
  - .specify/templates/plan-template.md (✅ updated)
  - .specify/templates/spec-template.md (✅ updated)
  - .specify/templates/tasks-template.md (✅ updated)
  - .specify/templates/checklist-template.md (✅ updated)
- Follow-up TODOs: None
-->

# Food Ordering System Constitution

## Core Principles

### I. Stateless JWT Authentication & Authorization
All client-server requests requiring identity MUST be authenticated via JSON Web Tokens (JWT) passed in the `Authorization: Bearer <token>` header. Access control MUST be strictly enforced on the server-side using roles (`customer` and `admin`) with middleware checks (`auth` and `adminGuard`). Client routes MUST reflect these security boundaries via `PrivateRoute` and `AdminRoute`.

### II. PayHere Sandbox Integration Flow
The payment gateway flow MUST generate secure parameters and MD5 signatures on the backend before checkout redirection. Upon payment completion, the backend webhook (`/api/payments/notify`) MUST validate incoming PayHere POST payload signatures against local MD5 signature computations before updating database status fields.

### III. Strict Mongoose Schema and Database Consistency
The application MUST use Mongoose models (`User`, `FoodItem`, `Order`, `Payment`) to strictly enforce database schema structures and relation integrity (e.g. Orders references to User, Payment reference to Order). All data mutation MUST go through Mongoose API.

### IV. Clean Separation of Layered Architecture
The backend MUST isolate concerns into `models/`, `middleware/`, `controllers/`, and `routes/`. The frontend MUST organize code into `src/components/` for reusable items, `src/pages/` for page views, and `src/context/` for client-side state.

### V. Comprehensive Data Seeding and Development Setup
A single admin seed script (`seed.js`) MUST be maintained to reset and initialize default items (e.g. Margherita, Cheeseburger, Cake) and the master admin account (`admin@food.com`). The local development environment MUST run the backend on port `5000` and the frontend on port `5173` with appropriate proxying.

## Technology Stack and Environment Configuration
The system utilizes React.js (Vite) + React Router + Axios for the frontend, Node.js + Express for the backend, MongoDB + Mongoose for data persistence, and PayHere Sandbox for payment processing. Configuration MUST be managed through `.env` variables (e.g., `MONGO_URI`, `JWT_SECRET`, `PAYHERE_MERCHANT_ID`, `PAYHERE_MERCHANT_SECRET`, `CLIENT_URL`, `SERVER_URL`).

## Quality Gates and Deployment Checklist
Before deploying, the development environment MUST be verified locally. Production builds MUST use ES Modules structure in both the client and server. The final delivery MUST include deployed links (Vercel for frontend, Render for backend) and a demonstration video showing successful customer and admin flow sequences.

## Governance
Changes to core principles or technology stack parameters require updating this constitution first. The versioning follows semantic rules (vMAJOR.MINOR.PATCH). Any plan or tasks generated must verify alignment with these rules.

**Version**: 1.0.0 | **Ratified**: 2026-06-27 | **Last Amended**: 2026-06-27
