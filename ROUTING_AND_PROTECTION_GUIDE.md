# Coredeck Routing and Protection Guide

> Reference guide for Coredeck routing, authentication, RBAC and API-aligned frontend modules.
>
> Use this document when adding routes, migrating legacy template screens, protecting pages or connecting a new screen to `dashboard-base-api`.

---

## Table of Contents

1. [Simple Explanation](#simple-explanation)
2. [Core Concepts](#core-concepts)
3. [Architecture](#architecture)
4. [Roles](#roles)
5. [Route Structure](#route-structure)
6. [Route Protection Flow](#route-protection-flow)
7. [Implementation Examples](#implementation-examples)
8. [Best Practices](#best-practices)
9. [New Route Checklist](#new-route-checklist)
10. [Troubleshooting](#troubleshooting)
11. [Quick Reference](#quick-reference)

---

## Simple Explanation

Coredeck routing works like a controlled access system.

- Routes are doors.
- Roles are keys.
- Guards check if the user can enter.
- Services connect the UI with the API.
- The backend is the real source of truth for permissions.

The frontend improves the user experience, but it must never be treated as the only security layer.

---

## Core Concepts

### Authentication

Authentication answers:

```txt
Who are you?
```

If the user is not authenticated, the app redirects to:

```txt
/auth/sign-in
```

### Authorization

Authorization answers:

```txt
What are you allowed to access?
```

If the user is authenticated but does not have enough authority, the app must redirect to an access denied flow.

### Company context

Some users need an active company context before using the app.

If the context is missing, the app redirects to:

```txt
/auth/company-select
```

After company selection, the app redirects to:

```txt
/workspaces
```

---

## Architecture

Coredeck frontend should follow this flow:

```txt
Component -> hook -> service -> ApiService -> AxiosBase -> backend
```

Examples:

```txt
UsersList -> useUsersList -> UsersService
WorkspacesList -> useWorkspacesList -> LocationsService
SupportTicketsList -> useSupportTicketsList -> SupportTicketsService
```

Rules:

- Components must not call Axios directly.
- Components should not know backend URLs.
- Hooks own loading, error and data behavior.
- Services own endpoint details.
- `ApiService` owns shared request behavior.
- Axios interceptors own shared headers and auth context.

---

## Roles

Frontend roles must match the backend contract.

Current Coredeck API roles:

```txt
SUPERADMIN
ADMIN
OPERATOR
CLIENT
```

Role meaning:

| Role | Purpose |
|---|---|
| SUPERADMIN | Global platform access |
| ADMIN | Company or workspace administration |
| OPERATOR | Operational access to assigned resources |
| CLIENT | Limited customer/user access |

Do not introduce frontend-only roles. If a new role is needed, update the backend contract first.

---

## API-Aligned Modules

A frontend module should exist only when it maps to a real backend router or an active Coredeck product screen.

Current active modules:

| Frontend module | Backend router | Route |
|---|---|---|
| Dashboard | dashboard | `/dashboard` |
| Users | users | `/users` |
| Workspaces | locations | `/workspaces` |
| Support tickets | support_tickets | `/support-tickets` |
| Auth | auth | `/auth/*` |

Planned API-aligned modules:

| Frontend module | Backend router |
|---|---|
| Companies | companies |
| Documents | documents |
| Notifications | notifications |
| Access logs | access_logs |
| Location logbook | location_logbook |
| Whitelists | whitelists |
| Blacklists | blacklists |
| Emergency contacts | emergency_contacts |
| Service contacts | service_contacts |
| Audit log | audit_log |

Template modules must be removed or migrated before becoming active Coredeck modules.

---

## Route Structure

Use clean product routes.

Preferred routes:

```txt
/dashboard
/users
/users/create
/users/:id
/users/:id/edit
/workspaces
/workspaces/create
/workspaces/:id
/workspaces/:id/edit
/support-tickets
```

Avoid legacy template routes:

```txt
/concepts/users/users-list
/concepts/workspaces/workspaces-list
/concepts/products/product-list
/concepts/help/manage-help
/concepts/news/manage-article
```

---

## Route Files

Public routes:

```txt
src/configs/routes.config/authRoute.ts
```

Protected route composition:

```txt
src/configs/routes.config/routes.config.ts
```

Active protected route groups:

```txt
src/configs/routes.config/dashboardsRoute.ts
src/configs/routes.config/workspacesRoute.ts
```

Guidelines:

- Keep route files small.
- Keep only active Coredeck modules.
- Remove route groups from the original template.
- Do not keep lazy imports to deleted folders.

---

## Route Protection Flow

Protected routes should check:

1. User is authenticated.
2. Route allows the user role.
3. Required company/workspace context exists.
4. The page renders only after those checks pass.

Important files:

```txt
src/components/route/ProtectedRoute.tsx
src/components/route/AuthorityGuard.tsx
src/components/route/SecureRoutesWithCommunities.tsx
src/utils/rbac
```

`SecureRoutesWithCommunities` is a legacy name. It should eventually be renamed to something like:

```txt
SecureRoutesWithCompanyContext
```

---

## Implementation Examples

### Protected route

```ts
{
    key: 'supportTickets.list',
    path: '/support-tickets',
    component: lazy(() => import('@/views/supportTickets/SupportTicketsList')),
    authority: [SUPERADMIN, ADMIN],
    meta: { pageContainerType: 'contained' },
}
```

### Sidebar item

```ts
{
    key: 'tickets',
    path: '/support-tickets',
    title: 'Tickets',
    type: NAV_ITEM_TYPE_ITEM,
    authority: [SUPERADMIN, ADMIN],
    subMenu: [],
}
```

### Service pattern

```ts
export async function apiGetAllSupportTickets(params?: SupportTicketsListParams) {
    return ApiService.fetchDataWithAxios({
        url: '/api/v1/support-tickets/all',
        method: 'get',
        params,
    })
}
```

---

## Best Practices

### Keep routes clean

Use:

```txt
/users
/workspaces
/support-tickets
```

Do not use:

```txt
/concepts/users/users-list
/concepts/workspaces/workspaces-list
```

### Keep modules API-aligned

If the backend has a router, the frontend module can exist.

If the backend does not have a router, remove or postpone the module.

### Remove dead mocks

Mocks are allowed only when explicitly temporary and documented.

Do not keep fake APIs for modules already connected to the backend.

### Do not mix business names

Coredeck must not contain old product or template domains.

Remove or migrate names such as:

```txt
Portería
Nexa
Acme
Firebase
Azure
communities
customers
properties
condos
```

### Backend remains the source of truth

The backend must validate:

- ownership,
- company scope,
- location/workspace scope,
- permissions,
- business rules.

---

## New Route Checklist

Before adding a route, confirm:

- [ ] The backend router exists.
- [ ] The frontend service exists.
- [ ] The page uses a hook.
- [ ] The hook uses a service.
- [ ] The service uses `ApiService`.
- [ ] The path is clean and product-based.
- [ ] The sidebar points to the same path.
- [ ] The route authority matches backend roles.
- [ ] No `/concepts/*` path is introduced.
- [ ] No mock is added unless explicitly temporary.
- [ ] Empty, loading and error states are handled.

---

## Troubleshooting

### User is redirected to login

Check:

- authentication state,
- stored session data,
- route wrapper,
- backend auth response.

### User is redirected to company select

Check:

- user role,
- selected company state,
- stored company context,
- company list API response.

### Route renders blank

Check:

- lazy import path,
- default export,
- deleted legacy folder references,
- runtime console errors.

### Sidebar item does not show

Check:

- navigation authority,
- backend role value,
- RBAC role normalization,
- route key uniqueness.

### Build fails with missing file

Search for stale imports:

```txt
@/views/concepts
@/views/dashboards
/concepts/
```

Then update the route or remove the stale import.

---

## Quick Reference

Active route roots:

```txt
/dashboard
/users
/workspaces
/support-tickets
/auth
```

Active view roots:

```txt
src/views/dashboard
src/views/users
src/views/workspaces
src/views/supportTickets
src/views/auth
```

Legacy folders to remove or migrate:

```txt
src/views/concepts
src/views/dashboards
src/views/others
src/views/ui-components
```

Core rule:

```txt
A frontend module exists only when it maps to a real backend router or an active Coredeck product screen.
```
