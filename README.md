# ERP System — Frontend

A full-featured Enterprise Resource Planning (ERP) web application built for managing products, categories, sales, users, and roles with a fine-grained permission system. The dashboard provides real-time business insights through charts, KPI cards, and stock alerts.

---

## 🔗 Links

| Resource | URL |
|---|---|
| **Live App** | `https://mini-erp-chi-ten.vercel.app` |
| **Frontend Repo** | `https://github.com/theabsparrow/erp-frontend.git` |
| **Backend Repo** | `https://github.com/theabsparrow/erp-backend.git` |


---

## 📸 Overview

The system is designed for small-to-medium businesses that need a centralized platform to:

- Track and manage product inventory
- Record and monitor sales transactions
- Manage staff accounts with role-based access control
- View business performance through a live analytics dashboard

---

## ✨ Features

### 📊 Dashboard
- KPI cards — total revenue, orders, products, users, categories
- Revenue trend area chart (last 7 days)
- Daily sales count bar chart (last 7 days)
- Top 5 selling products with horizontal bar chart and revenue table
- Low stock alert table (threshold: < 5 units) with out-of-stock indicators

### 📦 Products
- Full CRUD — create, view, update, delete products
- Product image upload
- Category-based filtering and name/SKU search
- Stock level badges (in stock / low stock / out of stock)
- Paginated product table

### 🗂️ Categories
- Create, update, and delete product categories
- Used as filters across the product module

### 🛒 Sales
- Create new sales with a live product search cart
- Real-time stock validation and quantity controls
- Grand total calculation
- Paginated sales history table with expandable item rows
- Per-sale detail page

### 👥 Users
- Admin-managed user accounts
- View user details and activity
- Create, update, and soft-delete users

### 🛡️ Roles & Permissions
- Create and manage roles with granular permission assignment
- 21 permissions across products, categories, sales, users, and roles
- Permission-guarded routes and UI elements

### 👤 Profile
- View and update personal profile
- Change password

### 🔐 Authentication
- JWT-based authentication with silent token refresh via HTTP-only cookies
- Proactive token expiry detection on every request
- Auto-redirect to login on session expiry

---

## 🛠️ Tech Stack

### Core
| Tech | Purpose |
|---|---|
| [React 19](https://react.dev) | UI framework |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [React Router v7](https://reactrouter.com) | Client-side routing |

### Data & State
| Tech | Purpose |
|---|---|
| [TanStack Query v5](https://tanstack.com/query) | Server state, caching, background refetch |
| [Axios](https://axios-http.com) | HTTP client with interceptors |

### UI & Styling
| Tech | Purpose |
|---|---|
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com) | Accessible component primitives |
| [Radix UI](https://www.radix-ui.com) | Headless UI components |
| [Lucide React](https://lucide.dev) | Icon library |
| [Recharts](https://recharts.org) | Charts and data visualisation |
| [Sonner](https://sonner.emilkowal.ski) | Toast notifications |
| [Framer Motion](https://www.framer.com/motion) | Animations |

### Forms & Validation
| Tech | Purpose |
|---|---|
| [React Hook Form](https://react-hook-form.com) | Form state management |
| [Zod](https://zod.dev) | Schema validation |

### Tables
| Tech | Purpose |
|---|---|
| [TanStack Table v8](https://tanstack.com/table) | Headless table logic |

---

## 📁 Project Structure

```
src/
├── api/              # Auth API helpers
├── components/       # Feature components
│   ├── home/         # Dashboard / stats
│   ├── products/     # Product CRUD + modals
│   ├── categories/   # Category CRUD + modals
│   ├── sales/        # Sales creation + history
│   ├── users/        # User management
│   ├── roles/        # Role & permission management
│   ├── profile/      # User profile
│   └── ui/           # Shared UI primitives (shadcn)
├── constants/        # Permissions, navigation routes
├── hooks/            # useGet, useMutate, useLogin, useSafeData
├── layouts/          # App shell layout
├── lib/              # Axios instance, API helpers, auth utils
├── pages/            # Route-level page components
├── provider/         # AuthProvider (context)
├── routes/           # Router config, ProtectedRoute
├── types/            # TypeScript interfaces
└── utills/           # Formatters, helpers
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- Backend API running (see backend repo)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/theabsparrow/erp-frontend.git
cd erp-frontend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in the values (see Environment Variables section below)

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root by copying `.env.example`:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `VITE_BASE_API` | ✅ | Base URL of the backend REST API (e.g. `http://localhost:5000/api/v1`) |
| `VITE_ADMIN_EMAIL` | Optional | Seed admin email for quick dev login |
| `VITE_ADMIN_PASS` | Optional | Seed admin password for quick dev login |
| `VITE_MANAGER_EMAIL` | Optional | Seed manager email for testing |
| `VITE_MANAGER_PASS` | Optional | Seed manager password for testing |
| `VITE_EMPLOYEE_EMAIL` | Optional | Seed employee email for testing |
| `VITE_EMPLOYEE_PASS` | Optional | Seed employee password for testing |

**Example `.env`:**

```env
VITE_BASE_API=http://localhost:5000/api/v1
VITE_ADMIN_EMAIL=admin@example.com
VITE_ADMIN_PASS=Admin@123
```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

---

## 🔐 Permission System

Routes and UI actions are guarded by a granular permission system. Permissions are assigned to roles, and roles are assigned to users.

| Module | Permissions |
|---|---|
| Products | `create_product`, `view_product`, `update_product`, `delete_product` |
| Categories | `create_category`, `view_category`, `update_category`, `delete_category` |
| Sales | `create_sale`, `view_sale`, `update_sale`, `delete_sale` |
| Users | `create_user`, `view_user`, `update_user`, `delete_user` |
| Roles | `create_role`, `view_role`, `update_role`, `delete_role` |
| Auth | `auth_change_password` |

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m 'feat: add your feature'`
4. Push to the branch — `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
