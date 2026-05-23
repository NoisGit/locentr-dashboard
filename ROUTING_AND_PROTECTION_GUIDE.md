# Coredeck Routing Guide

Coredeck routes must stay aligned with the real API modules.

## Active routes

```txt
/dashboard
/users
/workspaces
/support-tickets
/auth/sign-in
/auth/company-select
```

## Rules

- Use clean product paths.
- Do not use legacy `/concepts/*` paths.
- Do not keep template modules in routing.
- Components use hooks.
- Hooks use services.
- Services use `ApiService`.
- Backend permissions remain the source of truth.

## API-aligned modules

Current:

- Dashboard
- Users
- Workspaces
- Support tickets

Planned:

- Companies
- Documents
- Notifications
- Access logs
- Location logbook
- Whitelists
- Blacklists
- Emergency contacts
- Service contacts
- Audit log

## Cleanup rule

Remove or migrate legacy folders:

```txt
src/views/concepts
src/views/dashboards
src/views/others
src/views/ui-components
```
