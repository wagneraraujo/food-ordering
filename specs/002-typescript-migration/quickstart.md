# Quickstart Verification Guide: TypeScript Migration

This guide details the steps to start the migrated server and client in development mode, run compiler verification, and compile production-ready bundles.

## Prerequisites

1. MongoDB installed locally or MongoDB Atlas connection string configured in `server/.env`.
2. Node.js v18+ and `npm` installed.

---

## 1. Backend Verification

### Installing Dependencies
Ensure the required typescript compiler and runtime loader (`tsx`) are installed under `server/`:
```bash
cd server
npm install --save-dev typescript @types/node @types/express @types/cors @types/jsonwebtoken @types/bcryptjs tsx
```

### Verification Tasks
- **Start Development Server**: Runs hot-reloading with tsx:
  ```bash
  npm run dev
  ```
  *Expected Output*: `Server running on port 5000` and `Connected to MongoDB`.
- **Run Type-Checking**:
  ```bash
  npx tsc --noEmit
  ```
  *Expected Output*: Zero errors.
- **Build Production Bundle**:
  ```bash
  npm run build
  ```
  *Expected Output*: TypeScript compiles `.ts` files into a `dist/` directory containing clean `.js` ES modules.

---

## 2. Frontend Verification

### Installing Dependencies
Ensure typescript tools are installed under `client/`:
```bash
cd client
npm install --save-dev typescript @types/react @types/react-dom
```

### Verification Tasks
- **Start Vite Development Server**:
  ```bash
  npm run dev
  ```
  *Expected Output*: Vite dev server started on port 5173.
- **Run Type-Checking**:
  ```bash
  npx tsc --noEmit
  ```
  *Expected Output*: Zero errors.
- **Build Client Bundle**:
  ```bash
  npm run build
  ```
  *Expected Output*: Vite builds production-ready files in `client/dist/` without type errors.
