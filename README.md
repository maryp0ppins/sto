This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
# STO CRM

## Getting Started
This project is a simple CRM prototype for a car service station.
It uses **Next.js** with API routes backed by **MongoDB**.

First, run the development server:
## Setup

1. Install dependencies

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
npm install
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
2. Configure environment in `.env`:

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
```
MONGODB_URI=mongodb://localhost/sto
JWT_SECRET=verysecret
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
3. Create admin and demo users

## Learn More
```bash
npm run create-admin
```

To learn more about Next.js, take a look at the following resources:
4. Start the dev server

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
```bash
npm run dev
```

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
Visit `http://localhost:3000` and log in with `admin/admin` or `mech/mech`.

## Deploy on Vercel
## Functionality

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
- Search or create a client
- Choose or add a vehicle
- Select services from catalog
- Pick an available slot and mechanic
- Confirm to create a visit

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
This covers the initial booking flow. Services can be managed on `/dashboard/services`.
Other sections (kanban, reports) remain placeholders.