# Research & Technology Decisions: Core Food Ordering System

## Decisions & Rationales

### 1. ES Modules on Server

- **Decision**: Configure backend to use `"type": "module"` in `package.json` and use ES Import/Export syntax.
- **Rationale**: The project constitution requires production builds to use ES Modules structure in both client and server to keep imports consistent and modern.
- **Alternatives Considered**: CommonJS (default package.json main entry). Rejected because it violates the constitution's quality gates.

### 2. JWT Authentication Delivery

- **Decision**: Send JWT token in the `Authorization: Bearer <token>` header, storing the token in client `localStorage`.
- **Rationale**: Simple stateless implementation that complies with Principle I of the constitution. Allows easy integration with Axios interceptors and manual API testing via tools like Postman/cURL.
- **Alternatives Considered**: HTTP-only cookies. Rejected because it complicates cross-origin routing configurations if ports or hostnames differ in sandbox deployments.

### 3. Client State Management (Authentication and Cart)

- **Decision**: Use React Context API for global `AuthContext` (token, user profile, login/logout handlers) and local component state (or prop drilling) for the shopping cart.
- **Rationale**: The cart size is small and only needed on the Menu/Cart views. Context API avoids introducing external dependencies like Redux/Zustand.
- **Alternatives Considered**: Redux Toolkit, Zustand. Rejected as over-engineered for a simple single-page ordering cart.

### 4. PayHere MD5 Signature Verification

- **Decision**: Use Node's built-in `crypto` module to calculate MD5 hashes for payment verification.
- **Rationale**: Avoids bloated third-party libraries. The signature verification combines Merchant ID, Order ID, Amount, Currency, and Merchant Secret to securely authenticate PayHere webhook callbacks.
- **Alternatives Considered**: Third-party `md5` NPM library. Rejected to maintain a lean production dependency footprint.
