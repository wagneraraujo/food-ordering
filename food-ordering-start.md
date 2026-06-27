# Food Ordering System — Project Start

## Visão Geral

Aplicação full-stack de pedidos de comida com dois painéis (Customer e Admin), autenticação por role com JWT, e integração de pagamento via PayHere Sandbox.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React.js (Vite) + React Router + Axios |
| Backend | Node.js + Express |
| Banco de dados | MongoDB + Mongoose (Atlas free tier) |
| Autenticação | JWT (jsonwebtoken + bcryptjs) |
| Pagamento | PayHere Sandbox |
| Deploy | Vercel (FE) + Render (BE) + MongoDB Atlas |

---

## Estrutura de Pastas

```
food-ordering/
├── client/                  # React frontend
│   ├── src/
│   │   ├── api/             # Instância axios + chamadas
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── context/         # AuthContext
│   │   ├── pages/
│   │   │   ├── customer/    # Menu, Cart, Checkout, Confirmation
│   │   │   └── admin/       # Dashboard, Orders, Items, Users
│   │   ├── routes/          # PrivateRoute, AdminRoute
│   │   └── main.jsx
│   └── package.json
│
└── server/                  # Express backend
    ├── controllers/
    ├── middleware/
    │   ├── auth.js          # Verificação JWT
    │   └── adminGuard.js    # Verificação de role admin
    ├── models/
    │   ├── User.js
    │   ├── FoodItem.js
    │   ├── Order.js
    │   └── Payment.js
    ├── routes/
    │   ├── auth.js
    │   ├── items.js
    │   ├── orders.js
    │   ├── payments.js
    │   └── users.js
    ├── seed.js              # Seed admin + food items iniciais
    ├── .env
    └── package.json
```

---

## Setup Inicial

### 1. Criar estrutura de pastas

```bash
mkdir food-ordering && cd food-ordering
mkdir server
npm create vite@latest client -- --template react
```

### 2. Instalar dependências do backend

```bash
cd server
npm init -y
npm install express mongoose bcryptjs jsonwebtoken cors dotenv express-async-errors
npm install -D nodemon
```

### 3. Instalar dependências do frontend

```bash
cd client
npm install react-router-dom axios
```

### 4. Criar `.env` no servidor

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/food-ordering
JWT_SECRET=sua_chave_secreta_aqui

PAYHERE_MERCHANT_ID=1230000
PAYHERE_MERCHANT_SECRET=sua_secret_sandbox
PAYHERE_SANDBOX=true

CLIENT_URL=http://localhost:5173
```

---

## Models (Mongoose)

### User

```js
// server/models/User.js
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone:    { type: String },
  role:     { type: String, enum: ['customer', 'admin'], default: 'customer' },
}, { timestamps: true })

export default mongoose.model('User', userSchema)
```

### FoodItem

```js
// server/models/FoodItem.js
import mongoose from 'mongoose'

const foodItemSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  price:       { type: Number, required: true },
  category:    { type: String, enum: ['Pizza', 'Burger', 'Cake', 'Drink', 'Other'] },
  image:       { type: String },
  available:   { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('FoodItem', foodItemSchema)
```

### Order

```js
// server/models/Order.js
import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  item:     { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
  name:     String,
  price:    Number,
  quantity: Number,
})

const orderSchema = new mongoose.Schema({
  customer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:       [orderItemSchema],
  total:       { type: Number, required: true },
  status:      { type: String, enum: ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'], default: 'Pending' },
  paymentStatus: { type: String, enum: ['Unpaid', 'Paid', 'Failed'], default: 'Unpaid' },
  orderId:     { type: String, unique: true }, // ID gerado antes do checkout PayHere
}, { timestamps: true })

export default mongoose.model('Order', orderSchema)
```

### Payment

```js
// server/models/Payment.js
import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  order:          { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  paymentId:      String,   // retornado pelo PayHere
  status:         String,   // 2 = sucesso, 0 = pendente, -1 = cancelado, -2 = falhou
  amount:         Number,
  currency:       { type: String, default: 'LKR' },
  method:         String,
  payhereRawData: Object,   // payload completo do notify_url
}, { timestamps: true })

export default mongoose.model('Payment', paymentSchema)
```

---

## Autenticação

### Middleware JWT

```js
// server/middleware/auth.js
import jwt from 'jsonwebtoken'

export const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Token não fornecido' })

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Token inválido' })
  }
}

export const adminGuard = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Acesso negado' })
  next()
}
```

### Rotas de Auth

```js
// server/routes/auth.js
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body
  const exists = await User.findOne({ email })
  if (exists) return res.status(400).json({ message: 'Email já cadastrado' })

  const hash = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, password: hash, phone })
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.status(201).json({ token, user: { id: user._id, name: user.name, role: user.role } })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: 'Credenciais inválidas' })

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: user._id, name: user.name, role: user.role } })
})

export default router
```

---

## Integração PayHere

### Fluxo completo

```
Customer → POST /api/payments/init → backend gera hash e retorna params
         → frontend faz POST form para sandbox.payhere.lk/pay/checkout
         → PayHere redireciona para return_url (/confirmation)
         → PayHere chama notify_url (POST /api/payments/notify) com resultado
         → backend valida hash e atualiza Order.paymentStatus
```

### Geração do hash (backend)

```js
// server/routes/payments.js
import express from 'express'
import crypto from 'crypto'
import Order from '../models/Order.js'
import Payment from '../models/Payment.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

const md5 = (str) => crypto.createHash('md5').update(str).digest('hex').toUpperCase()

// Iniciar checkout — chamado pelo frontend antes de redirecionar
router.post('/init', auth, async (req, res) => {
  const { orderId } = req.body
  const order = await Order.findById(orderId).populate('customer')
  if (!order) return res.status(404).json({ message: 'Pedido não encontrado' })

  const merchantId = process.env.PAYHERE_MERCHANT_ID
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET
  const amount = order.total.toFixed(2)
  const currency = 'LKR'

  const hash = md5(
    merchantId +
    order.orderId +
    amount +
    currency +
    md5(merchantSecret)
  )

  res.json({
    merchant_id: merchantId,
    return_url:  `${process.env.CLIENT_URL}/confirmation`,
    cancel_url:  `${process.env.CLIENT_URL}/cart`,
    notify_url:  `${process.env.SERVER_URL}/api/payments/notify`,
    order_id:    order.orderId,
    items:       order.items.map(i => i.name).join(', '),
    amount,
    currency,
    hash,
    first_name:  order.customer.name.split(' ')[0],
    last_name:   order.customer.name.split(' ')[1] || '',
    email:       order.customer.email,
    phone:       order.customer.phone || '',
    address:     'N/A',
    city:        'N/A',
    country:     'Sri Lanka',
  })
})

// Webhook do PayHere — deve ser público (sem auth middleware)
router.post('/notify', async (req, res) => {
  const { merchant_id, order_id, payment_id, payhere_amount, payhere_currency, status_code, md5sig } = req.body

  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET
  const localHash = md5(
    merchant_id +
    order_id +
    payhere_amount +
    payhere_currency +
    status_code +
    md5(merchantSecret)
  )

  if (localHash !== md5sig) return res.sendStatus(400)

  const order = await Order.findOne({ orderId: order_id })
  if (!order) return res.sendStatus(404)

  if (status_code === '2') {
    order.paymentStatus = 'Paid'
    order.status = 'Preparing'
    await order.save()
    await Payment.create({
      order: order._id,
      paymentId: payment_id,
      status: status_code,
      amount: payhere_amount,
      currency: payhere_currency,
      payhereRawData: req.body,
    })
  }

  res.sendStatus(200)
})

export default router
```

### Checkout no Frontend

```jsx
// client/src/pages/customer/Checkout.jsx
const handlePayment = async () => {
  // 1. Criar o pedido no backend
  const { data: order } = await api.post('/orders', { items: cart })

  // 2. Buscar parâmetros do PayHere
  const { data: params } = await api.post('/payments/init', { orderId: order._id })

  // 3. Criar form e submeter para o PayHere Sandbox
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = 'https://sandbox.payhere.lk/pay/checkout'

  Object.entries(params).forEach(([key, value]) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = key
    input.value = value
    form.appendChild(input)
  })

  document.body.appendChild(form)
  form.submit()
}
```

---

## AuthContext (Frontend)

```jsx
// client/src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const login = (token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

---

## Rotas Protegidas (Frontend)

```jsx
// client/src/routes/PrivateRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const PrivateRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

export const AdminRoute = ({ children }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (user.role !== 'admin') return <Navigate to="/" />
  return children
}
```

---

## Seed Script

```js
// server/seed.js
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from './models/User.js'
import FoodItem from './models/FoodItem.js'

dotenv.config()
await mongoose.connect(process.env.MONGO_URI)

await User.deleteMany({})
await FoodItem.deleteMany({})

await User.create({
  name: 'Admin',
  email: 'admin@food.com',
  password: await bcrypt.hash('admin123', 10),
  role: 'admin',
})

await FoodItem.insertMany([
  { name: 'Margherita Pizza', description: 'Queijo e tomate', price: 1200, category: 'Pizza' },
  { name: 'Cheese Burger',    description: 'Duplo com cheddar', price: 800, category: 'Burger' },
  { name: 'Chocolate Cake',   description: 'Fatia generosa', price: 500, category: 'Cake' },
  { name: 'Pepperoni Pizza',  description: 'Extra pepperoni', price: 1400, category: 'Pizza' },
  { name: 'Crispy Fries',     description: 'Batata frita crocante', price: 350, category: 'Other' },
])

console.log('Seed concluído — admin@food.com / admin123')
await mongoose.disconnect()
```

Executar com:
```bash
node --experimental-vm-modules seed.js
```

---

## Rotas da API — Referência

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/api/auth/register` | — | Registrar customer |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/items` | — | Listar food items |
| POST | `/api/items` | Admin | Criar item |
| PUT | `/api/items/:id` | Admin | Editar item |
| DELETE | `/api/items/:id` | Admin | Remover item |
| POST | `/api/orders` | Customer | Criar pedido |
| GET | `/api/orders/mine` | Customer | Meus pedidos |
| GET | `/api/orders` | Admin | Todos os pedidos |
| PATCH | `/api/orders/:id/status` | Admin | Atualizar status |
| GET | `/api/users` | Admin | Listar clientes |
| POST | `/api/payments/init` | Customer | Gerar params PayHere |
| POST | `/api/payments/notify` | — (PayHere) | Webhook de confirmação |

---

## Scripts package.json (server)

```json
{
  "type": "module",
  "scripts": {
    "dev":   "nodemon server.js",
    "start": "node server.js",
    "seed":  "node seed.js"
  }
}
```

---

## Ordem de Implementação Sugerida

1. Setup de pastas e dependências
2. Conectar MongoDB + Models
3. Rotas de auth (register/login) + tela de login/register
4. CRUD de food items + tela de menu do customer
5. Carrinho de compras (estado local)
6. Criar pedido + integração PayHere
7. Webhook notify_url + atualização de status
8. Painel admin (pedidos, status, items, usuários)
9. Responsividade + polish visual
10. Deploy (Render + Vercel + Atlas) + ngrok substituído por URL pública

---

## Credenciais PayHere Sandbox

Criar conta em [payhere.lk](https://www.payhere.lk) e acessar o Sandbox Dashboard para obter:
- `Merchant ID`
- `Merchant Secret`

Cartões de teste disponíveis na [documentação do sandbox](https://support.payhere.lk/api-&-mobile-sdk/payhere-sandbox).

---

## Checklist de Entrega

- [ ] GitHub repo público com README
- [ ] Frontend deployed (Vercel)
- [ ] Backend deployed (Render) com `notify_url` pública
- [ ] MongoDB Atlas conectado
- [ ] Fluxo customer: register → menu → cart → pay → confirmation
- [ ] Fluxo admin: login → orders → update status → manage items
- [ ] Demo video (Google Drive) mostrando ambos os fluxos
- [ ] Formulário preenchido com nome, email, telefone, GitHub link e Drive link
