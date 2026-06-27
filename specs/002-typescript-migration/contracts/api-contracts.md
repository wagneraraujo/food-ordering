# API Interface Contracts (Typed)

The HTTP endpoints for the Food Ordering System remain functionally identical to [001-food-ordering-system's API contracts](../../001-food-ordering-system/contracts/api-contracts.md). This document highlights the concrete TypeScript request and response types for these interfaces.

## 1. Authentication Request/Response Contracts

### `POST /api/auth/register`
- **Request payload (`RegisterDTO`)**:
```typescript
export interface RegisterDTO {
  name: string;
  email: string;
  password?: string;
  phone: string;
}
```
- **Response payload (`AuthResponseDTO`)**:
```typescript
export interface AuthResponseDTO {
  token: string;
  user: {
    id: string;
    name: string;
    role: 'customer' | 'admin';
  };
}
```

### `POST /api/auth/login`
- **Request payload (`LoginDTO`)**:
```typescript
export interface LoginDTO {
  email: string;
  password?: string;
}
```

---

## 2. Food Item Management Contracts

### `POST /api/items` & `PUT /api/items/:id`
- **Request payload (`FoodItemDTO`)**:
```typescript
export interface FoodItemDTO {
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  available?: boolean;
}
```

---

## 3. Order Placement Contracts

### `POST /api/orders`
- **Request payload (`OrderPlacementDTO`)**:
```typescript
export interface OrderPlacementItem {
  item: string; // FoodItem ObjectId string
  quantity: number;
}

export interface OrderPlacementDTO {
  items: OrderPlacementItem[];
}
```
