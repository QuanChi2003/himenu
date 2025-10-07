# Beer Cầu Gẫy - Pub Ordering Website

## Overview
A comprehensive Next.js 14 pub ordering website for "Beer Cầu Gẫy" featuring PostgreSQL database, customer menu and ordering system with cart functionality, admin dashboard with sales reports and management tools, membership points system with tier levels, profit/loss tracking, and Telegram order notifications.

## Recent Changes (October 7, 2025)
- Created complete Next.js 14 project with TypeScript and Tailwind CSS v4
- Set up Replit PostgreSQL database with auto-initialization and demo data seeding
- Built customer-facing pages: homepage, menu, checkout, account
- Implemented admin dashboard with sales reports, categories, items, coupons, and members management
- Configured JWT authentication for admin panel
- Added Telegram integration for order notifications
- Created deployment configuration for Vercel

## User Preferences
- Use Vietnamese language throughout the interface
- Display "cre:Quân" attribution on all pages
- Auto-initialize database schema and seed demo data on first run
- Support both dine-in and delivery order types

## Project Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes, PostgreSQL (pg), JWT authentication
- **Charts**: Chart.js + react-chartjs-2
- **Notifications**: react-hot-toast
- **Deployment**: Vercel (configured)

### Database Schema
```sql
categories (id, parent_id, name, pos)
items (id, category_id, name, description, image_url, cost_price, sale_price, is_active)
coupons (id, code, discount_percent, start_date, end_date, is_active)
orders (id, customer_name, customer_phone, order_type, subtotal, discount, total, profit, coupon_id, created_at, status)
order_items (id, order_id, item_id, item_name, item_price, quantity)
members (id, phone, name, total_points, tier, join_date)
```

### Key Features
1. **Customer Features**:
   - Menu browsing with categorized items
   - Shopping cart with localStorage
   - Checkout with coupon validation
   - Membership points tracking (Regular → Silver → Gold → Platinum)
   - Order history lookup by phone number

2. **Admin Features**:
   - JWT-based authentication
   - Dashboard with sales/profit charts
   - CRUD operations for categories, items, coupons, members
   - Real-time reports

3. **Business Logic**:
   - Profit calculation: (sale_price - cost_price) × quantity
   - Membership points: 1 point per 1,000đ spent
   - Auto tier upgrades based on points
   - Telegram notifications for new orders

### File Structure
```
app/
├── page.tsx                    # Homepage
├── menu/page.tsx               # Menu with cart
├── checkout/page.tsx           # Checkout form
├── account/page.tsx            # Order history & points
├── admin/
│   ├── page.tsx               # Dashboard
│   ├── login/page.tsx         # Admin login
│   ├── categories/page.tsx    # Manage categories
│   ├── items/page.tsx         # Manage items
│   ├── coupons/page.tsx       # Manage coupons
│   └── members/page.tsx       # Manage members
└── api/
    ├── public/menu/route.ts   # Public menu API
    ├── orders/route.ts        # Order processing
    ├── account/route.ts       # Account lookup
    └── admin/                 # Admin APIs
        ├── login/route.ts
        ├── reports/route.ts
        ├── categories/route.ts
        ├── items/route.ts
        ├── coupons/route.ts
        └── members/route.ts
lib/db.ts                      # Database connection & initialization
```

### Environment Variables
Required secrets (configured in Replit Secrets):
- `DATABASE_URL` - PostgreSQL connection string
- `ADMIN_USER` - Admin username
- `ADMIN_PASS` - Admin password
- `JWT_SECRET` - JWT token secret
- `SESSION_SECRET` - Session secret
- `TELEGRAM_BOT_TOKEN` - Telegram bot token
- `TELEGRAM_CHAT_ID` - Telegram chat ID

### Deployment
The project is configured for Vercel deployment with `vercel.json`. Environment variables must be configured in Vercel dashboard before deployment.

## Known Issues
- Menu page may show loading state indefinitely on first load (requires browser hard refresh)
- Tailwind CSS v4 requires `@import "tailwindcss"` syntax instead of `@tailwind` directives
- LSP diagnostics present but do not affect functionality

## Development
```bash
npm install
npm run dev  # Starts on port 5000
```

Database is auto-initialized on first API call with demo Vietnamese pub items.
