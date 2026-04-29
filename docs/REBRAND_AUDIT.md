# Dashboard Base Identity Audit

## Goal

Transform this repository into an original portfolio-ready admin dashboard, separated from any previous brand, product name, logo, or business-specific identity.

The product identity direction is:

```text
Product name: Coredeck
Frontend name: Coredeck Dashboard
API name: Coredeck API
Demo email: admin@nois.dev
Demo password: 1234
Frontend repository: dashboard-base
Backend repository: dashboard-base-api
```

This repository must become the frontend companion for `dashboard-base-api`.

## Hard Rules

```text
No previous brand references.
No Nexa references.
No ECME references.
No old product logos.
No old product colors as identity.
No generated build folder committed.
```

## Current Status

The project was uploaded successfully to the new repository:

```text
NoisGit/dashboard-base
```

The repository still needs cleanup before making it public or deploying it again.

## High Priority Findings

### 1. README must use Coredeck only

The README was replaced with Coredeck Dashboard identity.

Required follow-up:

```text
Review README again before public release.
Add screenshots only after the UI is clean.
Add Vercel link only after the new clean deploy exists.
```

### 2. package.json package name

Current package name should be:

```json
"name": "dashboard-base"
```

After changing this locally, update the lock file with:

```bash
npm install
```

### 3. APP_NAME is empty

Current value:

```ts
export const APP_NAME = ''
```

Required change:

```ts
export const APP_NAME = 'Coredeck'
```

### 4. Demo identity must use Coredeck

Recommended visible demo identity:

```text
Product label: Coredeck
Dashboard label: Coredeck Dashboard
Demo email: admin@nois.dev
Demo password: 1234
Workspace label: Coredeck Workspace
```

### 5. Local code still contains condo-related modules

The local audit showed pending modules and files named around `condos`.

Recommended rename map:

```text
condos -> workspaces
CondosService -> WorkspaceService
CondosCreate -> WorkspaceCreate
CondosDetails -> WorkspaceDetails
CondosEdit -> WorkspaceEdit
CondosForm -> WorkspaceForm
CondosList -> WorkspaceList
CondoTabs -> WorkspaceTabs
useCondosList -> useWorkspaceList
useSyncCommunityFromCondo -> useSyncWorkspaceContext
```

These changes must be done carefully because imports, routes, stores, services, and navigation can break.

### 6. Build artifacts must stay out of Git

Required `.gitignore` entries:

```text
node_modules
build
dist
.env
.env.local
.DS_Store
```

## Recommended Frontend Domain

Use a generic SaaS/admin domain instead of residential or access-control-specific naming.

Recommended modules:

```text
- Auth
- Dashboard
- Users
- Workspaces
- Projects
- Support Tickets
- Reports
- Settings
- Audit Logs
```

## Recommended API Service Pattern

Keep services ordered and typed:

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

## Frontend/API Contract Direction

This frontend should consume `dashboard-base-api` through predictable endpoints:

```text
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
GET  /api/v1/users
GET  /api/v1/workspaces
GET  /api/v1/projects
GET  /api/v1/support-tickets
GET  /api/v1/dashboard/metrics
```

## Security Tasks

Required frontend security improvements:

```text
- Centralize token storage.
- Add refresh token strategy.
- Handle 401/403 safely.
- Protect private routes.
- Avoid exposing internal errors to the UI.
- Keep secrets out of frontend code.
```

## Suggested Work Order

```text
1. Set APP_NAME to Coredeck.
2. Replace visible demo identity with Coredeck and admin@nois.dev / 1234.
3. Confirm no old brand assets exist.
4. Rename condo modules to workspace modules.
5. Centralize endpoints.
6. Clean services and types.
7. Connect auth to dashboard-base-api.
8. Connect users/workspaces/projects/tickets.
9. Deploy clean project to Vercel.
```

## Deployment Rule

Do not reconnect Vercel until these checks pass:

```text
- No old logo files.
- No old brand text in README or UI.
- No generated build folder committed.
- package.json name is updated.
- APP_NAME is updated.
- App builds locally.
```
