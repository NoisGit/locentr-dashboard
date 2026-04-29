# Dashboard Base Rebrand Audit

## Goal

Transform this repository into an original portfolio-ready admin dashboard, separated from any previous brand, product name, logo, or business-specific identity.

The product identity direction is:

```text
Product name: Nois Admin
Demo email: admin@nois.dev
Frontend repository: dashboard-base
Backend repository: dashboard-base-api
```

This repository must become the frontend companion for `dashboard-base-api`.

## Current Status

The project was uploaded successfully to the new repository:

```text
NoisGit/dashboard-base
```

The repository still contains legacy naming and documentation that must be replaced before making it public or deploying it again.

## High Priority Findings

### 1. README still references the old brand

The current README still contains old branding, old clone instructions, old screenshots, and old color references.

Required change:

```text
Replace README with a new Nois Admin README.
```

Suggested sections:

```text
- Project overview
- Live demo placeholder
- Tech stack
- Local setup
- Environment variables
- Frontend architecture
- API integration with dashboard-base-api
- Roadmap
- Author
```

### 2. package.json still uses template name

Current package name:

```json
"name": "ecme"
```

Required change:

```json
"name": "dashboard-base"
```

After changing this, update the lock file locally with:

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
export const APP_NAME = 'Nois Admin'
```

### 4. Demo identity must use Nois

Recommended visible demo identity:

```text
Product label: Nois Admin
Demo email: admin@nois.dev
Workspace label: Nois Workspace
```

Avoid generic placeholder branding such as Nexa if the goal is to make the project feel more personal and original.

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

Generated build files previously contained old assets.

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
1. Replace README.
2. Rename package from ecme to dashboard-base.
3. Set APP_NAME to Nois Admin.
4. Replace visible demo identity with Nois Admin and admin@nois.dev.
5. Confirm no old brand assets exist.
6. Rename condo modules to workspace modules.
7. Centralize endpoints.
8. Clean services and types.
9. Connect auth to dashboard-base-api.
10. Connect users/workspaces/projects/tickets.
11. Deploy clean project to Vercel.
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
