# MVP Task Tracker

A minimalist SaaS task tracker for SMBs, built with Next.js, NestJS, and PostgreSQL.

## Project Structure

- `apps/web`: Frontend (Next.js App Router, TailwindCSS)
- `apps/api`: Backend (NestJS, Prisma, PostgreSQL)
- `infra`: Docker configuration
- `scripts`: Utility scripts (seed, migrate)

## Prerequisites

- Node.js 20+
- pnpm
- Docker & Docker Compose

## Getting Started (Local Development)

1. **Clone the repository**
    npx ts-node ../../scripts/seed.ts

    ```

5. **Access the App**:
    - Frontend: [http://localhost:3001](http://localhost:3001)
    - Backend: [http://localhost:3000](http://localhost:3000)
    - Adminer (DB UI): [http://localhost:8080](http://localhost:8080)

## Features

- **Auth**: JWT-based authentication (Login/Register).
- **Tasks**: Table and Kanban views.
- **Clients**: Client management.
- **Multi-tenancy**: Row-level security (prepared in schema).

## Deployment (Russia / Yandex Cloud)

1. **Database**: Use Yandex Managed Service for PostgreSQL.
2. **Storage**: Use Yandex Object Storage (S3 compatible).
3. **Compute**: Deploy Docker containers to Yandex Compute Cloud or Serverless Containers.

Set the following ENV variables in production:

```env
DATABASE_URL=postgres://user:pass@host:6432/db?sslmode=verify-full
S3_ENDPOINT=https://storage.yandexcloud.net
```

## Billing

Billing is abstracted via `BillingProvider`.

- `CloudPayments` adapter (mock)
- `YooKassa` adapter (mock)

## License

Private.
