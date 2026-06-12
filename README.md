# Locentr Dashboard

Locentr Dashboard is a React + TypeScript frontend for a portfolio SaaS operations platform.

Locentr is centered around companies, subcompanies, locations, access management, documents, support
tickets, audit logs, subscription billing and team administration.

## Project Status

This repository contains the active Locentr enterprise frontend.

It includes a public GSAP landing page, authentication, a tenant-aware operations dashboard,
14-day trial and plan flows, billing history, communication preferences, team invitations and
seat visibility.

## Product Direction

Locentr is a multi-company, multi-location operations dashboard.

```text
Company
├── Subcompanies
├── Users
├── Locations
│   ├── Operators
│   ├── Access lists
│   ├── Access logs
│   ├── Custom forms
│   ├── Emergency contacts
│   ├── Service contacts
│   └── Location logbook
├── Documents
├── Support tickets
└── Audit log
```

## Product Identity

```text
Product: Locentr
Frontend: Locentr Dashboard
Backend: Locentr API
Frontend repository: locentr-dashboard
Backend repository: locentr-api
```

## Important Domain Decision

`Workspaces` are no longer the official product concept.

The backend exposes `locations`, and the frontend should use **Locations** as the user-facing
module:

```text
Frontend route: /locations
Frontend service: LocationsService
Backend API: /api/v1/locations
```

Do not create `WorkspacesService` or new `/workspaces` routes unless the product architecture is
explicitly changed later.

## Tech Stack

| Area             | Technology      |
| ---------------- | --------------- |
| Framework        | React           |
| Language         | TypeScript      |
| Build Tool       | Vite            |
| Styling          | Tailwind CSS    |
| Motion           | GSAP + ScrollTrigger |
| State Management | Zustand         |
| Data Fetching    | SWR             |
| HTTP Client      | Axios           |
| Forms            | React Hook Form |
| Validation       | Zod             |
| Tables           | TanStack Table  |

## Local Development

Install dependencies and start the Vite development server:

```bash
npm install
npm run dev
```

Open the URL printed by Vite, normally:

```text
http://localhost:5173
```

Do not serve the repository root with VS Code Live Server. The source `index.html` imports
`/src/main.tsx`, which must be transformed by Vite.

To preview a production build:

```bash
npm run build
npm run preview
```

Run the complete local quality baseline:

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run test:e2e
npm run build
```

Configure the API explicitly:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_API_PROXY_TARGET=http://127.0.0.1:8000
VITE_TELEMETRY_ENDPOINT=
```

`VITE_API_BASE_URL` is the URL consumed by Axios. `VITE_API_PROXY_TARGET` only controls the optional
Vite development proxy and must never contain credentials.

`VITE_TELEMETRY_ENDPOINT` is optional. When configured, the frontend sends sanitized errors,
authentication outcomes and Web Vitals to that collector. It never sends passwords, authorization
headers or tokens.

VS Code Live Server is configured to serve `build/` only, so `npm run build` must be run before
using it.

## Roles

```text
SUPERADMIN
ADMIN
OPERATOR
CLIENT
```

Frontend route protection improves UX, but backend authorization remains the source of truth.

## Active Frontend Modules

| Frontend area     | Route        | Service                   | Backend router                                                    |
| ----------------- | ------------ | ------------------------- | ----------------------------------------------------------------- |
| Dashboard         | `/dashboard` | `DashboardService`        | `/api/v1/dashboard`                                               |
| Companies         | `/companies` | `CompaniesService`        | `/api/v1/companies`                                               |
| Users             | `/users`     | `UsersService`            | `/api/v1/users`                                                   |
| Buildings         | `/buildings` | `LocationsService`        | `/api/v1/locations`                                               |
| Access Management | `/access`    | `AccessManagementService` | `/api/v1/whitelists`, `/api/v1/blacklists`, `/api/v1/access-logs` |
| Documents         | `/documents` | `DocumentsService`        | `/api/v1/documents`                                               |
| Audit Log         | `/audit`     | `AuditLogService`         | `/api/v1/audit-log`                                               |
| Support Tickets   | `/tickets`   | `SupportTicketsService`   | `/api/v1/support-tickets`                                         |
| Location Logbook  | `/logbook`   | `LocationLogbookService`  | `/api/v1/location-logbook`                                        |
| Team & licenses   | `/settings/team` | `TeamsService`         | `/api/v1/teams`                                                   |
| Plan & billing    | `/settings/billing` | `LifecycleService`, `SubscriptionsService` | `/api/v1/lifecycle`, `/api/v1/subscriptions` |
| Public landing    | `/`          | GSAP + React              | Public plan catalogue                                             |

The building detail includes an operator-only police access panel. It generates the backend-provided
public path, converts it to the complete `/api/v1` URL and renders it as a QR code. The current API
permit expires after 30 minutes and is reusable until expiration.

Shared field validators live in `src/utils/validation/schemas.ts`, while API errors are normalized
through `src/utils/apiError.ts`. Forms compose these shared primitives instead of redefining
messages and limits independently.

Operational requests include an `x-request-id`. The frontend reports sanitized failures and Web
Vitals through `TelemetryService`, while `AppErrorBoundary` provides a controlled recovery screen
for unexpected render failures.

## Removed or Postponed Concepts

```text
Projects
Workspaces as a separate domain
Organizations as a separate domain
Legacy mailbox/email templates
Template demo pages and mocks
```

If any of these return later, they need a new architecture decision and API contract first.

## Architecture Rules

- Data flows through `Component -> hook -> service -> ApiService -> AxiosBase`.
- Components do not call Axios directly.
- Services own endpoint URLs aligned with `locentr-api`.
- Hooks own SWR, loading, errors and mutations.
- Route labels, navigation labels and services must use the same domain language.
- The UI calls operational locations “Buildings”; the API contract remains `locations`.
- `SUPERADMIN` is provisioned outside the dashboard and never appears in user creation.
- Mocks are not a product data source.

Legacy aliases remain temporarily available:

```text
/locations
/access-management
/audit-log
/support-tickets
```

## Portfolio Demo

Start `locentr-api` on port `8000`, then run:

```bash
npm install
npm run dev
```

The frontend expects the API at `http://127.0.0.1:8000` unless `VITE_API_BASE_URL` overrides it.
The portfolio seed is owned by the API repository and intentionally keeps its password outside Git.

## Repository Workflow

`main` is the release branch. Feature branches are short-lived and deleted after merge.

## Author

Developed by [NoisGit](https://github.com/NoisGit).
