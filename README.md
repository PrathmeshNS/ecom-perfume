# LUXESCENT - Premium Perfume E-Commerce

A full-stack MVP e-commerce application for selling perfumes.

## Tech Stack

**Frontend:** React (Vite), Tailwind CSS, React Router, Context API, React Hook Form + Zod  
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT Auth  
**Services:** Cloudinary (images), Manual QR Payment  

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account

### Backend Setup

```bash
cd server
cp .env.example .env    # Fill in your secrets
npm install
npm run seed            # Seeds categories, products, admin user
npm run dev             # Starts on port 5000
```

### Frontend Setup

```bash
cd client
npm install
npm run dev             # Starts on port 5173
```

### Default Admin Credentials
- **Email:** admin@luxescent.com
- **Password:** admin123

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register user | - |
| POST | /api/auth/login | Login | - |
| GET | /api/auth/me | Current user | User |
| GET | /api/products | List products (paginated) | - |
| GET | /api/products/:id | Product details | - |
| POST | /api/products | Create product | Admin |
| PUT | /api/products/:id | Update product | Admin |
| DELETE | /api/products/:id | Delete product | Admin |
| GET | /api/categories | List categories | - |
| POST | /api/categories | Create category | Admin |
| GET | /api/cart | Get cart | User |
| POST | /api/cart/add | Add to cart | User |
| POST | /api/cart/remove | Remove from cart | User |
| POST | /api/orders | Place order | User |
| GET | /api/orders | User orders | User |
| GET | /api/admin/orders | All orders | Admin |
| PUT | /api/admin/orders/:id | Update order | Admin |

## Deployment

- **Frontend:** Deploy `client/` to Vercel
- **Backend:** Deploy `server/` to Render

Set environment variables on each platform accordingly.
