# AI SOP API Service

NestJS-based REST API for conversational SOP generation, PDCA management, and weekly reviews.

## Prerequisites

- Node.js >= 20
- PostgreSQL >= 14
- pnpm (recommended) or npm

## Setup

### 1. Install Dependencies

From project root:
```bash
pnpm install
# or
npm install
```

### 2. Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
# or for development
cp .env.development.example .env
```

Edit `.env` and configure:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Strong random secret for JWT tokens
- Other optional variables as needed

### 3. Database Setup

#### Generate Prisma Client
```bash
npm run prisma:generate
```

#### Run Migrations
```bash
npm run prisma:migrate
```

This will:
- Apply all pending migrations
- Generate Prisma Client with latest schema

#### (Optional) Open Prisma Studio
```bash
npm run prisma:studio
```

### 4. Start Development Server

```bash
npm run start:dev
```

API will be available at:
- API: http://localhost:3000/api/v1
- Swagger Docs: http://localhost:3000/api/docs

## Available Scripts

- `npm run start` - Start production server
- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:contract` - Run API contract tests (Dredd)
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:3000/api/docs
- OpenAPI Spec: http://localhost:3000/api/docs-json

## Authentication

All API endpoints (except those marked with `@Public()`) require JWT authentication.

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Project Structure

```
src/
├── common/           # Shared modules (auth, guards, decorators)
├── tags/            # Tags API module
├── app.module.ts    # Root module
└── main.ts          # Application entry point
```

## Database

Schema and migrations are managed via Prisma:
- Schema: `prisma/schema.prisma`
- Migrations: `prisma/migrations/`

See [Prisma Documentation](https://www.prisma.io/docs) for more details.
