This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Backend and database

The backend uses Next.js App Router route handlers and Prisma 7 with PostgreSQL.
Copy `.env.example` to `.env` and set `DATABASE_URL` to your local `solvrex_crm`
database connection string. Keep `.env` local and do not commit credentials.

The existing database tables are introspected; the app does not create or reset
them. After configuring `DATABASE_URL`, run:

```bash
npm run db:pull
npm run db:generate
npm run db:seed
npm run dev
```

To seed the initial Admin account, set `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL`,
and `SEED_ADMIN_PASSWORD` in your local `.env` before running `npm run db:seed`.
The seed creates the account only when the email is unused and stores an
Argon2id password hash.

Test `GET http://localhost:3000/api/roles` in a browser or Postman to fetch roles
from PostgreSQL.

## Transactional email

The server-side email service uses Resend. Set `RESEND_API_KEY` and
`RESEND_FROM_EMAIL` in `.env` using a sender address verified with Resend. These
variables are private and must not use a `NEXT_PUBLIC_` prefix.

To send a development test message, pass the recipient address explicitly:

```bash
npm run email:test -- recipient@example.com
```

Email templates live in `templates/email/`; add new template identifiers and
their required variables to the allowlist in `services/email.service.ts`.
WhatsApp templates are kept separately in `templates/whatsapp/`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
