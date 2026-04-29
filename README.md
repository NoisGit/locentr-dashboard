# Nois Admin

Nois Admin is a modern dashboard foundation built with React, TypeScript, Vite, Tailwind CSS, Zustand, SWR, React Hook Form, Zod and Axios.

This project is designed as a portfolio-ready admin interface that will connect to `dashboard-base-api` as its backend.

## Project Status

This repository is in active cleanup and rebuild mode.

Current goals:

- Remove all previous product identity.
- Keep the project fully owned under the Nois identity.
- Prepare a clean frontend architecture for real API consumption.
- Build a professional dashboard suitable for a developer portfolio.
- Connect the app with `dashboard-base-api` through typed services.

## Product Identity

```text
Product: Nois Admin
Demo email: admin@nois.dev
Frontend repository: dashboard-base
Backend repository: dashboard-base-api
```

## Tech Stack

| Area | Technology |
|---|---|
| Framework | React |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Data Fetching | SWR |
| HTTP Client | Axios |
| Forms | React Hook Form |
| Validation | Zod |
| Tables | TanStack Table |
| Deployment | Vercel |

## Environment Variables

Create a `.env` file from the example file when available:

```bash
cp .env.example .env
```

Recommended local configuration while the API is being prepared:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_ENABLE_MOCK=true
```

Recommended configuration when the API is ready:

```env
VITE_API_BASE_URL=https://your-api-url.com/api/v1
VITE_ENABLE_MOCK=false
```

## Run Locally

Clone the repository:

```bash
git clone https://github.com/NoisGit/dashboard-base.git
cd dashboard-base
```

Install dependencies:

```bash
npm install --legacy-peer-deps
```

Start the development server:

```bash
npm run dev
```

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run lint:fix
npm run prettier
npm run prettier:fix
npm run format
```

## Architecture Direction

The frontend will be organized around reusable admin modules:

```text
src
├── auth
├── components
├── configs
├── constants
├── hooks
├── services
├── store
└── views
```

Expected service structure:

```text
src/services
├── ApiService.ts
├── axios
├── endpoints
├── modules
│   ├── auth
│   ├── users
│   ├── workspaces
│   ├── projects
│   └── tickets
└── types
```

## API Integration Direction

This frontend is planned to consume `dashboard-base-api` through endpoints like:

```text
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/me
GET  /users
GET  /workspaces
GET  /projects
GET  /support-tickets
GET  /dashboard/metrics
```

## Roadmap

- Clean previous identity from files, docs and UI.
- Rename remaining legacy business modules to generic admin modules.
- Improve folder and service organization.
- Add real authentication flow.
- Add typed API services.
- Connect users, workspaces, projects and support tickets.
- Add protected routes and safer token handling.
- Reconnect Vercel only when the project is clean and stable.

## Repository Workflow

```text
feature branches → develop → main → Vercel
```

For now, `main` contains the initial clean upload. New work should be done in feature branches or `develop` once created.

## Author

Developed by NoisGit.
