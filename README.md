# AEGIS HOSTEL (RoomiFY) — Zero-Trust Multi-Tenant SaaS Platform

AEGIS HOSTEL is a production-ready multi-tenant SaaS platform built for Hostel and PG Management. Designed with a **Zero-Trust security paradigm**, it features PostgreSQL Row-Level Security (RLS), atomic double-booking prevention using PostgreSQL `FOR UPDATE` locks with Prisma `$transaction`, automated SLA breach prediction for maintenance ticketing, speakeasy TOTP Multi-Factor Authentication (MFA), and Stripe payment integration.

---

## 🏗 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14.2 (App Router), TypeScript 5.4, Tailwind CSS 3.4, Shadcn/ui (Radix UI), Zustand, TanStack Query |
| **Backend** | NestJS 10.x, TypeScript, Express, Prisma 5.12 ORM, class-validator, class-transformer |
| **Database** | Supabase PostgreSQL 15 (Connection Pooler) |
| **Auth** | `@nestjs/passport`, Passport-JWT, Speakeasy (TOTP), Argon2id (Hashing) |
| **Payments** | Stripe 14.x (Checkout Sessions + Webhooks) |
| **Storage** | Supabase Storage (Private Bucket) |
| **Logging** | Winston JSON Logger |

---

## 🔒 Security Architecture Highlights

1. **PostgreSQL RLS Isolation**: `TenantInterceptor` reads JWT claims, extracts `hostelId`, and executes `SELECT set_config('app.current_hostel', hostelId, true)` prior to controller route handling.
2. **Double-Booking Prevention**: Booking creation executes within a `Serializable` Prisma transaction acquiring an explicit `FOR UPDATE` lock on the target room row.
3. **SLA Breach Prediction**: `TicketsService` queries historical average resolution times per category over the last 30 days and predicts breach risk against policy thresholds.
4. **Argon2id Hashing**: Passwords are hashed using `argon2id` with 64MB memory cost. Refresh tokens are hashed before storage to enable session revocation upon theft detection.
5. **Zero-Trace Log Redaction**: `LoggingInterceptor` redacts passwords, JWT tokens, and MFA secrets before writing JSON logs to `logs/combined.log`.

---

## 🚀 Step-by-Step Local Setup

### 1. Database & RLS Initialization
1. Create a Supabase PostgreSQL project.
2. Execute the RLS policy script against your Supabase SQL Editor:
   ```bash
   # Execute content of rls_policies.sql in your Supabase SQL Editor
   ```

### 2. Backend Setup (`/backend`)
```bash
cd backend

# Copy Environment File
cp .env.example .env
# Edit .env with your PostgreSQL DATABASE_URL, Supabase, Stripe, and JWT secrets

# Install Dependencies
npm install

# Push Database Schema & Generate Prisma Client
npx prisma db push
npx prisma generate

# Start Development Server
npm run start:dev
```
The NestJS API server will run on `http://localhost:5000/api`.

---

### 3. Frontend Setup (`/frontend`)
```bash
cd frontend

# Copy Environment File
cp .env.example .env.local

# Install Dependencies
npm install

# Start Next.js Development Server
npm run dev
```
The Next.js web application will be accessible at `http://localhost:3000`.

---

## 📂 Project Structure Overview

```
/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma              # Database Models & Enums
│   ├── src/
│   │   ├── common/                    # Guards, Interceptors, Filters, Decorators
│   │   ├── config/                    # Joi Env Validation
│   │   ├── modules/
│   │   │   ├── auth/                  # Auth, JWT, Local, Speakeasy TOTP MFA
│   │   │   ├── users/                 # Profile & Vector Roommate Matcher
│   │   │   ├── hostels/               # Multi-Tenant Hostel Mgmt
│   │   │   ├── rooms/                 # Heatmap & Capacity Engine
│   │   │   ├── bookings/              # FOR UPDATE Transactional Engine
│   │   │   ├── tickets/               # SLA Predictive Maintenance
│   │   │   ├── marketplace/           # Stripe Checkout Integration
│   │   │   ├── transactions/          # Stripe Webhooks Receiver
│   │   │   ├── audit/                 # Immutable Audit Logger
│   │   │   └── supabase/              # Signed URL Storage Engine
│   │   └── main.ts                    # Helmet, CORS Whitelist, Pipes
├── frontend/
│   ├── src/
│   │   ├── app/                       # Next.js App Router Routes & Layouts
│   │   ├── components/                # Shadcn/ui & UI Layout Components
│   │   ├── lib/                       # Axios Interceptors & Utilities
│   │   ├── store/                     # Zustand Memory Auth Store
│   │   └── middleware.ts              # Edge Route Guarding
├── rls_policies.sql                   # Complete PostgreSQL RLS Script
└── README.md
```
