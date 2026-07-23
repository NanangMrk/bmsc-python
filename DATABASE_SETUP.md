# BMSC Database Setup & Prisma Management Guide

This document explains how to set up, migrate, and seed the BMSC MySQL database in local development and production environments.

---

## 1. Environment Configuration

The backend connects to MySQL using the `DATABASE_URL` string in `backend/.env`.

Format:
```env
DATABASE_URL="mysql://<user>:<password>@<host>:<port>/<database_name>"
```

Example (Local Development):
```env
DATABASE_URL="mysql://root:root@localhost:3306/bmsc_db"
```

Example (Production Server):
```env
DATABASE_URL="mysql://bmsc_user:SuperSecurePass123!@127.0.0.1:3306/bmsc_db"
```

---

## 2. Database Migration Commands

Navigate to the `backend/` directory before executing Prisma commands:

```bash
cd backend
```

### A. Initializing / Deploying Migrations (Production)
To apply pending migrations to the production database safely:
```bash
npx prisma migrate deploy
```

### B. Creating New Migrations (Development Only)
When schema changes are made to `prisma/schema.prisma`:
```bash
npx prisma migrate dev --name describe_your_change
```

### C. Regenerating Prisma Client
Always regenerate the Prisma Client after migrating or pulling updates:
```bash
npx prisma generate
```

---

## 3. Database Seeding System

Seeding populates the database with initial required records (e.g., Super Admin Role, initial Super Admin User account `admin@email.com` / `password123`).

### Executing Seed Command
In `backend/package.json`, seeding is configured using `tsx` to ensure complete compatibility with TypeScript 5.x and ESM/CommonJS modules without `ts-node` rootDir file resolution errors:

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

To run the database seed:
```bash
npx prisma db seed
```

---

## 4. Verification & Troubleshooting

### Check Seed Status
Verify Super Admin user creation by inspecting output:
```text
Role created: Super Admin
Super Admin user created: admin@email.com / password123
```

### Common Issues & Resolution

1. **`Cannot read properties of undefined (reading fileExists)`**:
   - **Cause**: Legacy `ts-node` incompatible with `rootDir: "./src"` setting in `backend/tsconfig.json`.
   - **Fix**: Ensure `backend/package.json` specifies `"prisma": { "seed": "tsx prisma/seed.ts" }` and `tsx` is installed as a devDependency.

2. **Connection Refused / Access Denied**:
   - Verify MySQL service status: `sudo systemctl status mysql`.
   - Verify database user credentials and GRANT permissions in MySQL.
