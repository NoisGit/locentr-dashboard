# Locentr Routing and Protection Guide

Reference guide for Locentr routing, authentication, RBAC and API-aligned frontend modules.

Use this document when adding routes, cleaning legacy template screens, protecting pages or connecting a new screen to `locentr-api`.

## Core rule

A frontend module exists only when it maps to a real backend router or an active Locentr product screen.

Frontend route protection improves UX. The backend remains the source of truth for authorization, ownership and tenant scope.

## Product routing model

```txt
Component -> hook -> service -> ApiService -> AxiosBase -> locentr-api
```

Rules:

- Components do not call Axios directly.
- Components do not know backend URLs.
- Hooks own loading, error and mutation behavior.
- Services own endpoint details.
- `ApiService` owns shared request behavior.
- Axios interceptors own shared headers and auth context.

## Roles

Frontend roles must match the backend contract.

```txt
SUPERADMIN
ADMIN
OPERATOR
CLIENT
```

| Role | Purpose |
|---|---|
| SUPERADMIN | Platform-level administration. |
| ADMIN | Company/subcompany/location administration. |
| OPERATOR | Operational access to assigned locations. |
| CLIENT | Read or limited access to company/location data. |

Do not introduce frontend-only roles. If a new role is needed, update the backend contract first.

## RBAC model

Routes and navigation use `roles` and `permissions`.

Do not use legacy `authority`.

```ts
{
    key: 'locations.list',
    path: '/locations',
    component: lazy(() => import('@/views/locations/LocationsList/LocationsList')),
    roles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERATOR, Role.CLIENT],
    permissions: [Permission.VIEW_LOCATIONS],
}
```

```ts
{
    key: 'locations',
    path: '/locations',
    title: 'Locations',
    translateKey: 'nav.locations',
    icon: 'landing',
    type: NAV_ITEM_TYPE_ITEM,
    roles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERATOR, Role.CLIENT],
    permissions: [Permission.VIEW_LOCATIONS],
    subMenu: [],
}
```

Main files:

```txt
src/utils/rbac/types.ts
src/utils/rbac/rbacCore.ts
src/components/route/AuthorityGuard.tsx
src/components/shared/AuthorityCheck.tsx
src/configs/routes.config/*.ts
src/configs/navigation.config/*.ts
```

## Active frontend modules

| Frontend module | Route | Service | Backend router |
|---|---|---|---|
| Dashboard | `/dashboards` | `DashboardService` | `/api/v1/dashboard` |
| Companies | `/companies` | `CompaniesService` | `/api/v1/companies` |
| Users | `/users` | `UsersService` | `/api/v1/users` |
| Locations | `/locations` | `LocationsService` | `/api/v1/locations` |
| Access Management | `/access-management` | `AccessManagementService` | `/api/v1/whitelists`, `/api/v1/blacklists`, `/api/v1/access-logs` |
| Documents | `/documents` | `DocumentsService` | `/api/v1/documents` |
| Notifications | `/notifications` | `NotificationsService` | `/api/v1/notifications` |
| Audit Log | `/audit-log` | `AuditLogService` | `/api/v1/audit-log` |
| Support Tickets | `/support-tickets` | `SupportTicketsService` | `/api/v1/support-tickets` |

## Active route roots

```txt
/dashboards
/companies
/users
/locations
/access-management
/documents
/notifications
/audit-log
/support-tickets
/auth
```

## Active view roots

```txt
src/views/dashboard
src/views/companies
src/views/users
src/views/locations
src/views/accessManagement
src/views/documents
src/views/notifications
src/views/auditLog
src/views/supportTickets
src/views/auth
```

## Removed or postponed concepts

```txt
Workspaces as a separate domain
Organizations as a separate domain
Projects
Template demo pages
Legacy concepts routes
Legacy mock server
```

`Locations` is the official domain. Do not add `/workspaces` routes or `WorkspacesService` unless the product architecture changes later.

## Route protection flow

Protected routes should check:

1. User is authenticated.
2. Route allows the user role.
3. Route permissions match the user.
4. Backend validates tenant/object-level access.
5. The page renders only after those checks pass.

## New route checklist

Before adding a route, confirm:

- [ ] The backend router exists.
- [ ] The frontend service exists.
- [ ] The page uses a hook when data loading is needed.
- [ ] The hook uses a service.
- [ ] The service uses `ApiService`.
- [ ] The path is clean and product-based.
- [ ] The sidebar/mobile navigation points to the same path.
- [ ] The route uses `roles` and `permissions`.
- [ ] No `authority` field is introduced.
- [ ] No `/concepts/*` path is introduced.
- [ ] No mock is added unless explicitly temporary.
- [ ] Empty, loading and error states are handled.

## Troubleshooting

### User is redirected to login

Check authentication state, stored session data, route wrapper and backend auth response.

### User is redirected to dashboard

Check route `roles`, route `permissions`, backend role value and RBAC normalization.

### Route renders blank

Check lazy import path, default export, deleted legacy folder references and runtime console errors.

### Sidebar item does not show

Check navigation `roles`, navigation `permissions`, backend role value and route key uniqueness.

### Build fails with missing file

Search for stale imports:

```txt
@/views/concepts
@/views/workspaces
/concepts/
/workspaces
```

Then update the route or remove the stale import.

## Naming rules

Use Locentr naming consistently:

```txt
Product: Locentr
Frontend: Locentr Dashboard
Backend: Locentr API
Frontend repo: locentr-dashboard
Backend repo: locentr-api
```

Avoid old product names, old template modules and previous prototype infrastructure names.
