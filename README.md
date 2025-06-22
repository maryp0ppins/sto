# STO CRM

This project is a simple CRM prototype for a car service station.
It uses **Next.js** with API routes backed by **MongoDB**.

## Setup

1. Install dependencies

```bash
npm install
```

2. Configure environment in `.env`:

```
MONGODB_URI=mongodb://localhost/sto
JWT_SECRET=verysecret
```

3. Create an admin user

```bash
npm run create-admin
```

4. Start the dev server

```bash
npm run dev
```

Visit `http://localhost:3000` and log in with `admin/admin`.

## Functionality

- Search or create a client
- Choose or add a vehicle
- Select services from catalog
- Pick an available slot and mechanic
- Confirm to create a visit

This covers the initial booking flow. Other sections (kanban, reports) are placeholders.
