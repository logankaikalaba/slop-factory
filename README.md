# Slop Factory

Media content management platform — images, video, and text.

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9 (`npm i -g pnpm`)
- **MongoDB** running locally on port 27017 (or set `MONGODB_URI`)

## Setup

```bash
# Install all workspace dependencies
pnpm install

# Build shared types (must build first — other packages depend on it)
pnpm build:shared

# Copy environment config for the server
cp packages/server/.env.example packages/server/.env
```

## Development

```bash
# Run everything in parallel (server + client + shared watch)
pnpm dev

# Or run individually
pnpm dev:server   # Express API on http://localhost:4000
pnpm dev:client   # Next.js on http://localhost:3000
```

## Build

```bash
pnpm build        # Builds shared first, then server + client in parallel
```

## Project Structure

```
slop-factory/
├── packages/
│   ├── shared/        # Shared TypeScript types & constants
│   ├── server/        # Express + MongoDB API
│   └── client/        # Next.js (App Router) frontend
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

## API Endpoints

| Method | Path              | Description            |
| ------ | ----------------- | ---------------------- |
| GET    | /api/health       | Health check           |
| POST   | /api/media/upload | Upload files           |
| GET    | /api/media        | List media (paginated) |
| GET    | /api/media/:id    | Get single media item  |
| DELETE | /api/media/:id    | Delete media item      |
| POST   | /api/text         | Create text content    |
| GET    | /api/text         | List text (paginated)  |
| GET    | /api/text/:id     | Get single text item   |
| DELETE | /api/text/:id     | Delete text item       |
