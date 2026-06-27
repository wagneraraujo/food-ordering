# Research Notes: TypeScript Migration

This document records technical decisions, options evaluated, and best practices for migrating the Food Ordering System (both Express backend and React-Vite frontend) to TypeScript.

## Decision 1: Backend TypeScript Runtime & Loader

- **Decision**: Use `tsx` (TypeScript Execute) for local development running and `tsc` (TypeScript compiler) to generate production-ready JavaScript code.
- **Rationale**: The backend uses ES Modules (`"type": "module"`). Running ES Modules directly in Node using `ts-node` requires complex experimental ESM loaders. On the other hand, `tsx` is built on top of `esbuild` and handles ES Modules, path aliases, and TypeScript out of the box with zero configuration. It is also significantly faster than standard `ts-node`.
- **Alternatives considered**:
  - `ts-node-dev`: Fails or requires experimental loaders with `"type": "module"`.
  - `ts-node --esm`: Working alternative but has slower startup times and strict ESM resolution constraints.

---

## Decision 2: Mongoose Typed Models

- **Decision**: Define Mongoose schemas using standard TypeScript document interfaces that extend Mongoose's generic type wrappers (`mongoose.Document`).
- **Rationale**: Mongoose v7+ and v8+ support strong typings natively. By declaring TypeScript interfaces representing the document structures (e.g. `IUser`, `IFoodItem`), we can type-check database query results, model definitions, and updates directly.
- **Alternatives considered**:
  - `HydratedDocument<T>`: Mongoose's utility type for hydrated instances. We will leverage this inside controller files to represent models returned from queries.

---

## Decision 3: Frontend TypeScript Bundler Setup

- **Decision**: Keep Vite's built-in bundler (using esbuild for fast TS transpilation) and run type checks separately via the TypeScript compiler `tsc --noEmit`.
- **Rationale**: Vite compiles TypeScript files very quickly by skipping type verification during development/build runs. Running `tsc --noEmit` on checkin/build phases ensures type safety checks run in the CI/CD pipeline or pre-build, preserving fast local hot-reload speeds.
- **Alternatives considered**:
  - `vite-plugin-checker`: Runs type checks in the background during Vite runs. Rejected to avoid slowing down dev server reloading times.

---

## Decision 4: Express Context and Request Typing

- **Decision**: Extend standard Express `Request` types by defining a custom namespace or typescript declaration for `req.user` (injected via authentication middleware).
- **Rationale**: By default, Express `Request` does not have a `user` property. We will create a local types file (e.g. `server/types/index.d.ts` or custom interface extension) to define this property cleanly, allowing type-safe routing.
- **Alternatives considered**:
  - Global `d.ts` declaration override: Requires tsconfig typeRoots config.
  - Custom wrapper interface `AuthenticatedRequest`: Simpler, cleaner, and more explicit. We will use `AuthenticatedRequest` extending `Request`.
