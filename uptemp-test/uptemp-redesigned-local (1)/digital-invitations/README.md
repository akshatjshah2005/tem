# Digital Invitation Platform

Create, personalize, and share beautiful animated invitations for weddings, birthdays, and special events.

## Tech Stack

- **Frontend:** Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Cache:** Redis
- **File Storage:** AWS S3 / Cloudflare R2 (configurable)

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL 16+
- Redis 7+
- npm or yarn

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd digital-invitations
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start database services

```bash
docker-compose up -d
```

Or use your local PostgreSQL and Redis instances.

### 4. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
# Edit .env with your database credentials
```

### 5. Initialize database

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 6. Start development servers

```bash
npm run dev
```

This starts both the API server (http://localhost:4000) and the web app (http://localhost:3000).

## Project Structure

```
digital-invitations/
├── apps/
│   ├── api/              # Express API server
│   └── web/              # Next.js frontend
├── packages/
│   ├── database/         # Prisma schema and client
│   └── shared/           # Shared types and utilities
├── templates/            # Invitation template assets
├── docs/                 # Documentation
└── scripts/              # Build and deployment scripts
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all development servers |
| `npm run dev:api` | Start API server only |
| `npm run dev:web` | Start web app only |
| `npm run build` | Build all applications |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |

## Features

- [ ] User authentication (register/login)
- [ ] Dashboard with invitation management
- [ ] Template selection and customization
- [ ] Multiple event support
- [ ] Photo upload and gallery
- [ ] Guest management with Excel import
- [ ] Personalized invitation links
- [ ] WhatsApp message templates
- [ ] RSVP system
- [ ] Analytics dashboard
- [ ] QR code generation
- [ ] Admin panel

## API Documentation

API endpoints are available at `http://localhost:4000/api`. See the API documentation in the `docs/` folder for details.

## License

MIT License
