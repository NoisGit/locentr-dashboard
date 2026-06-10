# Locentr Dashboard

Locentr Dashboard is a React + TypeScript frontend for a portfolio SaaS operations platform.

Locentr is centered around companies, subcompanies, locations, access management, documents, support tickets and audit logs.

## Project Status

This repository is in active cleanup and rebuild mode.

Current goals:

- Keep the frontend aligned with `locentr-api`.
- Remove obsolete template and demo modules.
- Use real API services instead of mocks.
- Keep routing, navigation and permissions coherent with backend roles.
- Prepare a professional SaaS dashboard suitable for a developer portfolio.

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

The backend exposes `locations`, and the frontend should use **Locations** as the user-facing module:

```text
Frontend route: /locations
Frontend service: LocationsService
Backend API: /api/v1/locations
```

Do not create `WorkspacesService` or new `/workspaces` routes unless the product architecture is explicitly changed later.

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

Do not serve the repository root with VS Code Live Server. The source
`index.html` imports `/src/main.tsx`, which must be transformed by Vite.

To preview a production build:

```bash
npm run build
npm run preview
```

Configure the API explicitly:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_API_PROXY_TARGET=http://127.0.0.1:8000
```

`VITE_API_BASE_URL` is the URL consumed by Axios. `VITE_API_PROXY_TARGET`
only controls the optional Vite development proxy and must never contain
credentials.

VS Code Live Server is configured to serve `build/` only, so `npm run build`
must be run before using it.

## Roles

```text
SUPERADMIN
ADMIN
OPERATOR
CLIENT
```

Frontend route protection improves UX, but backend authorization remains the source of truth.

## Active Frontend Modules

| Frontend area | Route | Service | Backend router |
|---|---|---|---|
| Dashboard | `/dashboards` | `DashboardService` | `/api/v1/dashboard` |
| Companies | `/companies` | `CompaniesService` | `/api/v1/companies` |
| Users | `/users` | `UsersService` | `/api/v1/users` |
| Locations | `/locations` | `LocationsService` | `/api/v1/locations` |
| Access Management | `/access-management` | `AccessManagementService` | `/api/v1/whitelists`, `/api/v1/blacklists`, `/api/v1/access-logs` |
| Documents | `/documents` | `DocumentsService` | `/api/v1/documents` |
| Audit Log | `/audit-log` | `AuditLogService` | `/api/v1/audit-log` |
| Support Tickets | `/support-tickets` | `SupportTicketsService` | `/api/v1/support-tickets` |

Notifications remain disabled in routing and navigation until
`locentr-api#27` registers the router and its OpenAPI methods match the
frontend contract.

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

- Components do not call Axios directly.
- Services use `ApiService` and endpoint URLs aligned with the backend.
- Hooks own data loading and mutation behavior.
- Route labels, navigation labels and services must use the same domain language.
- `Locations` replaces the previous `Workspaces` naming.

## Repository Workflow

```text
feature branches → develop → main → deploy
```

## Author

Developed by NoisGit.
