# 🛡️ Guía Completa de Manejo de Rutas y Protección RBAC

> **📖 Documentación de referencia** para el sistema de protección de rutas basado en roles y permisos (RBAC).  
> Esta guía está diseñada para que los desarrolladores puedan consultarla cuando necesiten implementar nuevas funcionalidades o resolver problemas relacionados con el acceso a rutas.

## 📋 Tabla de Contenidos

### 🎯 Para Empezar

1. [Explicación Simple - ¿Cómo Funciona Todo Esto?](#explicación-simple---cómo-funciona-todo-esto)
2. [Cómo Usar Esta Documentación](#cómo-usar-esta-documentación)

### 📚 Fundamentos

3. [Arquitectura General](#arquitectura-general)
4. [Sistema de Roles y Permisos](#sistema-de-roles-y-permisos)
5. [Estructura de Rutas](#estructura-de-rutas)
6. [Componentes de Protección](#componentes-de-protección)
7. [Flujo de Autenticación y Autorización](#flujo-de-autenticación-y-autorización)

### 💻 Guías Prácticas

8. [Ejemplos de Implementación](#ejemplos-de-implementación)
9. [Mejores Prácticas](#mejores-prácticas)
10. [Checklist de Nueva Ruta](#checklist-de-implementación-de-nueva-ruta)

### 🔧 Soporte

11. [Troubleshooting](#troubleshooting)
12. [Referencias Rápidas](#referencias-rápidas-por-tarea)

---

## 🎯 Explicación Simple - ¿Cómo Funciona Todo Esto?

### Introducción para Desarrolladores

Este documento te ayudará a entender cómo funciona el sistema de protección de rutas en esta aplicación.

### 🔑 Los 3 Elementos Clave

#### 1. **Las Llaves (Roles)**

Son como diferentes tipos de tarjetas de acceso:

- **🏆 SUPERADMIN** = Llave maestra (abre TODAS las puertas)
- **👔 ADMIN** = Llave de administrador (abre casi todas las puertas)
- **📋 SUBADMIN** = Llave limitada (solo algunas puertas específicas)

#### 2. **Los Guardias de Seguridad (Componentes de Protección)**

Son como personal de seguridad en cada puerta que verifican tu tarjeta:

- **`ProtectedRoute`** = Guardia que revisa si tienes la llave correcta
- **`SecureRoutes`** = Jefe de seguridad que organiza a todos los guardias
- **`RBAC`** = Sistema de verificación central

#### 3. **Las Reglas de Acceso (Permisos)**

Son instrucciones específicas sobre qué puedes hacer en cada habitación:

- **`VIEW_USERS`** = "Puedes ver la lista de usuarios"
- **`CREATE_USER`** = "Puedes crear nuevos usuarios"
- **`DELETE_USER`** = "Puedes eliminar usuarios"

---

### 📝 ¿Cómo Funciona en la Práctica?

#### **Escenario 1: Usuario Intenta Entrar**

```
1. 👤 Usuario: "Quiero ir a /users/list"
   
2. 🚪 Sistema: "¿Estás identificado? Muéstrame tu credencial"
   
3. 👤 Usuario: "Sí, aquí está: soy ADMIN"
   
4. 🔍 ProtectedRoute: "Déjame revisar..."
   - ✅ "Tienes credencial válida"
   - ✅ "La ruta requiere rol ADMIN o SUPERADMIN"
   - ✅ "Tú eres ADMIN... perfecto!"
   - ✅ "También revisaré permisos: necesitas VIEW_USERS"
   - ✅ "Los ADMIN tienen ese permiso"
   
5. ✅ Sistema: "¡Adelante! Te dejo pasar"
```

#### **Escenario 2: Usuario Sin Permiso**

```
1. 👤 Usuario: "Quiero ir a /system/settings"
   
2. 🚪 Sistema: "¿Estás identificado?"
   
3. 👤 Usuario: "Sí, soy SUBADMIN"
   
4. 🔍 ProtectedRoute: "Déjame revisar..."
   - ✅ "Tienes credencial válida"
   - ❌ "Esta ruta solo permite SUPERADMIN"
   - ❌ "Tú eres SUBADMIN"
   
5. 🚫 Sistema: "Lo siento, no puedes pasar"
   ↪️  Te redirijo a /access-denied
```

#### **Escenario 3: Usuario No Identificado**

```
1. 👤 Usuario: "Quiero ir a /dashboard"
   
2. 🚪 Sistema: "¿Estás identificado?"
   
3. 👤 Usuario: "Emmm... no"
   
4. 🔍 ProtectedRoute: "Sin credencial, no pasas"
   
5. 🚫 Sistema: "Primero tienes que identificarte"
   ↪️  Te redirijo a /auth/sign-in
```

---

### 🎓 Los 3 Conceptos Principales Explicados

#### **Concepto 1: Autenticación vs Autorización**

**Autenticación** = "¿Quién eres?"

```javascript
// Verificar si el usuario está logueado
if (!user) {
    // No estás identificado → Ve al login
    redirect('/auth/sign-in')
}
```

**Autorización** = "¿Qué puedes hacer?"

```javascript
// Verificar si tienes permiso
if (!RBAC.hasRole(user, [Role.ADMIN])) {
    // Estás identificado, pero no tienes permiso
    redirect('/access-denied')
}
```

#### **Concepto 2: RBAC (Role-Based Access Control)**

Es como un sistema de **llaves y cerraduras**:

```javascript
// Definimos quién tiene acceso a qué
const route = {
    path: '/users',
    roles: [Role.ADMIN, Role.SUPERADMIN],  // ← Solo estas llaves abren
    permissions: [Permission.VIEW_USERS],   // ← Y necesitas este permiso
}

// El sistema verifica automáticamente
if (user tiene una de las llaves) {
    if (user tiene el permiso) {
        ✅ Acceso permitido
    } else {
        ❌ Acceso denegado
    }
}
```

#### **Concepto 3: Protección en Capas**

La seguridad tiene **3 capas** (como muñecas rusas):

```
🎯 Capa 1: ¿Estás logueado?
    └─ Si NO → Login
    
    🎯 Capa 2: ¿Tienes el rol correcto?
        └─ Si NO → Access Denied
        
        🎯 Capa 3: ¿Tienes el permiso específico?
            └─ Si NO → Access Denied
            └─ Si SÍ → ✅ Bienvenido!
```

---

### � ¿Cómo Saber Qué Hacer Cuando...?

Esta sección te ayudará a encontrar rápidamente lo que necesitas según tu situación:

#### **Quiero crear una nueva página protegida**

→ Ve a la sección [Ejemplos de Implementación](#ejemplos-de-implementación) y usa el [Checklist de Nueva Ruta](#checklist-de-implementación-de-nueva-ruta)

#### **No entiendo por qué un usuario no puede acceder**

→ Ve a la sección [Troubleshooting](#troubleshooting) - Problema 1

#### **Necesito entender los roles y permisos disponibles**

→ Ve a la sección [Sistema de Roles y Permisos](#sistema-de-roles-y-permisos)

#### **Quiero ocultar un botón según permisos**

→ Ve a [Ejemplo 7: Protección en Componentes](#ejemplo-7-protección-en-componentes-no-en-rutas)

#### **El sistema me redirige en bucle infinito**

→ Ve a [Troubleshooting](#troubleshooting) - Problema 2

---

### 📊 Diagrama Mental Simple

```
┌─────────────────────────────────────────────┐
│         Usuario Intenta Acceder             │
└────────────────┬────────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │ ¿Logueado?    │
         └───────┬───────┘
                 │
        ┌────────┴────────┐
        │ NO              │ SÍ
        ▼                 ▼
   ┌─────────┐    ┌──────────────┐
   │ Login   │    │ ¿Rol OK?     │
   └─────────┘    └──────┬───────┘
                         │
                ┌────────┴────────┐
                │ NO              │ SÍ
                ▼                 ▼
           ┌─────────┐    ┌──────────────┐
           │ Denied  │    │ ¿Permiso OK? │
           └─────────┘    └──────┬───────┘
                                 │
                        ┌────────┴────────┐
                        │ NO              │ SÍ
                        ▼                 ▼
                   ┌─────────┐    ┌──────────┐
                   │ Denied  │    │ ✅ PASS  │
                   └─────────┘    └──────────┘
```

---

### 🎁 Beneficios del Sistema

1. **🔒 Seguridad Centralizada**
   - Un solo lugar donde se verifica todo
   - No hay que repetir código de seguridad en cada página

2. **🧩 Fácil de Mantener**
   - Para agregar una nueva página protegida, solo defines: roles + permisos
   - El sistema hace el resto automáticamente

3. **🎯 Granularidad**
   - Puedes controlar acceso por rol (ej: solo ADMIN)
   - O por permiso específico (ej: puede VER pero no ELIMINAR)

4. **🚀 Escalable**
   - Fácil agregar nuevos roles en el futuro
   - Fácil agregar nuevos permisos
   - No rompe el código existente

5. **🐛 Menos Errores**
   - Al estar centralizado, si hay un bug de seguridad, se arregla en un solo lugar
   - TypeScript ayuda a prevenir errores (detecta si usas un permiso que no existe)

---

### ✍️ Resumen en Una Frase

> **"Es un sistema automático de puertas con cerraduras: defines qué llave (rol) abre qué puerta (ruta), y el sistema verifica y permite/niega el acceso automáticamente."**

---

## 🏗️ Arquitectura General

El sistema de routing implementa un **modelo RBAC (Role-Based Access Control)** multinivel con las siguientes características:

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                      USUARIO AUTENTICADO                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │    AuthProvider (Context)     │
         │  - Gestión de autenticación   │
         │  - Estado del usuario         │
         │  - Token management           │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │      SecureRoutes             │
         │  - Enrutador principal        │
         │  - Separa rutas públicas      │
         │    y protegidas               │
         └───────────────┬───────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌────────────────┐            ┌──────────────────┐
│ Public Routes  │            │ Protected Routes │
│ (Sin auth)     │            │ (Con RBAC)       │
└────────────────┘            └────────┬─────────┘
                                       │
                                       ▼
                         ┌──────────────────────┐
                         │   ProtectedRoute     │
                         │  - Verifica roles    │
                         │  - Verifica permisos │
                         │  - Redirige si deny  │
                         └──────────────────────┘
```

---

## 🎭 Sistema de Roles y Permisos

### Jerarquía de Roles

El sistema utiliza **3 roles principales**:

```typescript
// src/constants/roles.constant.ts
// src/utils/rbac/types.ts

export enum Role {
    SUPERADMIN = 'SUPERADMIN',  // ID: 1 - Acceso total sin restricciones
    ADMIN = 'ADMIN',            // ID: 2 - Administrador de comunidad
    SUBADMIN = 'SUBADMIN',      // ID: 6 - Administrador limitado
}
```

#### 📊 Matriz de Capacidades por Rol

| Capacidad | SUPERADMIN | ADMIN | SUBADMIN |
|-----------|------------|-------|----------|
| Bypass de permisos | ✅ | ❌ | ❌ |
| Gestión de usuarios | ✅ | ✅ | ⚠️ (Limitado) |
| Gestión de comunidades | ✅ | ✅ | ❌ |
| Gestión de condominios | ✅ | ✅ | ✅ |
| Gestión de propiedades | ✅ | ✅ | ✅ |
| Gestión de residentes | ✅ | ✅ | ✅ |
| Control de accesos | ✅ | ✅ | ✅ |
| Configuración global | ✅ | ❌ | ❌ |

### Sistema de Permisos Granulares

```typescript
// src/utils/rbac/types.ts

export enum Permission {
    // Dashboard
    VIEW_DASHBOARD = 'view:dashboard',

    // Users (CRUD)
    VIEW_USERS = 'view:users',
    CREATE_USER = 'create:user',
    EDIT_USER = 'edit:user',
    DELETE_USER = 'delete:user',

    // Communities
    VIEW_COMMUNITIES = 'view:communities',
    CREATE_COMMUNITY = 'create:community',
    EDIT_COMMUNITY = 'edit:community',
    DELETE_COMMUNITY = 'delete:community',

    // Condos
    VIEW_CONDOS = 'view:condos',
    CREATE_CONDO = 'create:condo',
    EDIT_CONDO = 'edit:condo',
    DELETE_CONDO = 'delete:condo',

    // ... y más
}
```

#### 🔑 Mapeo de Permisos por Rol

```typescript
// src/utils/rbac/types.ts

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    [Role.SUPERADMIN]: [
        // SUPERADMIN tiene TODOS los permisos
        // (En la práctica, el sistema hace bypass automático)
    ],

    [Role.ADMIN]: [
        // Dashboard
        Permission.VIEW_DASHBOARD,

        // Users - Full CRUD
        Permission.VIEW_USERS,
        Permission.CREATE_USER,
        Permission.EDIT_USER,
        Permission.DELETE_USER,

        // Communities - Full CRUD
        Permission.VIEW_COMMUNITIES,
        Permission.CREATE_COMMUNITY,
        Permission.EDIT_COMMUNITY,
        Permission.DELETE_COMMUNITY,

        // Condos - Full CRUD
        Permission.VIEW_CONDOS,
        Permission.CREATE_CONDO,
        Permission.EDIT_CONDO,
        Permission.DELETE_CONDO,

        // Properties - Full CRUD
        Permission.VIEW_PROPERTIES,
        Permission.CREATE_PROPERTY,
        Permission.EDIT_PROPERTY,
        Permission.DELETE_PROPERTY,

        // ... todos los módulos
    ],

    [Role.SUBADMIN]: [
        // Dashboard
        Permission.VIEW_DASHBOARD,

        // Users - Solo lectura y edición limitada
        Permission.VIEW_USERS,
        Permission.EDIT_USER,

        // Condos - Full CRUD
        Permission.VIEW_CONDOS,
        Permission.CREATE_CONDO,
        Permission.EDIT_CONDO,
        Permission.DELETE_CONDO,

        // Properties - Full CRUD
        Permission.VIEW_PROPERTIES,
        Permission.CREATE_PROPERTY,
        Permission.EDIT_PROPERTY,
        Permission.DELETE_PROPERTY,

        // Residents
        Permission.VIEW_RESIDENTS,
        Permission.CREATE_RESIDENT,
        Permission.EDIT_RESIDENT,
        Permission.DELETE_RESIDENT,

        // Access Control
        Permission.VIEW_ACCESS,
        Permission.CREATE_ACCESS,

        // ... permisos limitados
    ],
}
```

---

## 📁 Estructura de Rutas

### Organización de Archivos

```
src/
├── configs/
│   └── routes.config/
│       ├── index.ts                  # Exporta rutas públicas y protegidas
│       ├── routes.config.ts          # Combina todas las rutas
│       ├── authRoute.ts              # Rutas de autenticación (públicas)
│       ├── dashboardsRoute.ts        # Rutas de dashboards (protegidas)
│       ├── conceptsRoute.ts          # Rutas de conceptos (protegidas)
│       ├── uiComponentsRoute.ts      # Rutas de UI (protegidas)
│       ├── guideRoute.ts             # Rutas de guías (protegidas)
│       └── othersRoute.ts            # Rutas especiales (access-denied, etc)
│
├── components/
│   ├── rbac/
│   │   ├── SecureRoutes.tsx          # Componente principal de routing
│   │   └── ProtectedRoute.tsx        # Guard de protección RBAC
│   └── route/
│       ├── AuthorityGuard.tsx        # Guard legacy (deprecated)
│       ├── ProtectedRoute.tsx        # Guard básico de autenticación
│       └── PublicRoute.tsx           # Guard para rutas públicas
│
└── utils/
    └── rbac/
        ├── rbacCore.ts               # Lógica principal RBAC
        ├── types.ts                  # Tipos y permisos
        └── index.ts                  # Exportaciones
```

### Definición de Tipos de Ruta

```typescript
// src/@types/routes.tsx

export interface Meta {
    pageContainerType?: 'default' | 'gutterless' | 'contained'
    pageBackgroundType?: 'default' | 'plain'
    header?: PageHeaderProps
    footer?: boolean
    layout?: LayoutType
}

export type Route = {
    key: string                      // Identificador único de la ruta
    path: string                     // Path de la URL
    component: LazyExoticComponent   // Componente a renderizar

    // 🆕 Sistema RBAC (RECOMENDADO)
    roles?: Role[]                   // Roles permitidos
    permissions?: Permission[]       // Permisos requeridos
    requireAllPermissions?: boolean  // true = AND, false = OR

    // ⚠️ DEPRECATED - Usar 'roles' en su lugar
    authority?: string[]

    meta?: Meta                      // Metadata de layout
}
```

---

## 🛡️ Componentes de Protección

### 1. ProtectedRoute (RBAC)

**Ubicación:** `src/components/rbac/ProtectedRoute.tsx`

Este es el componente principal de protección que implementa el sistema RBAC completo.

```typescript
interface ProtectedRouteProps {
    roles?: Role[]                   // Roles permitidos
    permissions?: Permission[]       // Permisos requeridos
    requireAllPermissions?: boolean  // Si se requieren TODOS los permisos
    fallbackPath?: string            // Ruta de redirección (default: /access-denied)
    allowSuperAdmin?: boolean        // Permitir SUPERADMIN siempre (default: true)
    children: ReactNode
}
```

#### Lógica de Verificación

```typescript
// Pseudocódigo de la lógica interna

function ProtectedRoute({
    children, 
    roles, 
    permissions, 
    requireAllPermissions = true,
    allowSuperAdmin = true
}) {
    const { user } = useAuth()

    // 1. Verificar autenticación
    if (!user) {
        return <Navigate to="/auth/sign-in" />
    }

    // 2. Permitir acceso a página de access-denied
    if (location.pathname === '/access-denied') {
        return children
    }

    // 3. SUPERADMIN bypass
    if (allowSuperAdmin && RBAC.isSuperAdmin(user)) {
        return children
    }

    // 4. Verificar roles (si se especificaron)
    if (roles && roles.length > 0) {
        const hasRole = RBAC.hasAnyRole(user, roles)
        if (!hasRole) {
            return <Navigate to="/access-denied" />
        }
    }

    // 5. Verificar permisos (si se especificaron)
    if (permissions && permissions.length > 0) {
        const hasPermission = requireAllPermissions
            ? RBAC.hasAllPermissions(user, permissions)
            : RBAC.hasAnyPermission(user, permissions)
        
        if (!hasPermission) {
            return <Navigate to="/access-denied" />
        }
    }

    // 6. Acceso concedido
    return children
}
```

### 2. SecureRoutes (Router Principal)

**Ubicación:** `src/components/rbac/SecureRoutes.tsx`

Componente de nivel superior que gestiona el enrutamiento global.

```typescript
interface SecureRoutesProps {
    protectedRoutes: Routes         // Rutas protegidas
    publicRoutes: Routes            // Rutas públicas
    protectedWrapper?: Component    // Wrapper opcional para rutas protegidas
    publicWrapper?: Component       // Wrapper opcional para rutas públicas
}
```

#### Renderizado de Rutas

```typescript
const SecureRoutes = ({ protectedRoutes, publicRoutes }) => {
    return (
        <Routes>
            {/* Rutas protegidas */}
            {protectedRoutes.map(route => (
                <Route
                    key={route.key}
                    path={route.path}
                    element={
                        <ProtectedRoute
                            roles={route.roles}
                            permissions={route.permissions}
                            requireAllPermissions={route.requireAllPermissions}
                        >
                            <PageContainer {...route.meta}>
                                <Component />
                            </PageContainer>
                        </ProtectedRoute>
                    }
                />
            ))}

            {/* Rutas públicas (sin protección) */}
            {publicRoutes.map(route => (
                <Route
                    key={route.key}
                    path={route.path}
                    element={<Component />}
                />
            ))}
        </Routes>
    )
}
```

### 3. RBAC Core (Utilidades)

**Ubicación:** `src/utils/rbac/rbacCore.ts`

Lógica centralizada de verificación de permisos.

```typescript
export const RBAC = {
    /**
     * Verifica si el usuario es SUPERADMIN
     */
    isSuperAdmin(user: AuthUser): boolean {
        const role = extractUserRole(user)
        return role === Role.SUPERADMIN
    },

    /**
     * Verifica si el usuario tiene AL MENOS UNO de los roles especificados
     */
    hasAnyRole(user: AuthUser, allowedRoles: Role[]): boolean {
        const userRole = extractUserRole(user)
        if (!userRole) return false
        return allowedRoles.includes(userRole)
    },

    /**
     * Verifica si el usuario tiene AL MENOS UNO de los permisos
     */
    hasAnyPermission(user: AuthUser, requiredPermissions: Permission[]): boolean {
        const userRole = extractUserRole(user)
        if (!userRole) return false
        
        const userPermissions = ROLE_PERMISSIONS[userRole]
        return requiredPermissions.some(perm => userPermissions.includes(perm))
    },

    /**
     * Verifica si el usuario tiene TODOS los permisos especificados
     */
    hasAllPermissions(user: AuthUser, requiredPermissions: Permission[]): boolean {
        const userRole = extractUserRole(user)
        if (!userRole) return false
        
        const userPermissions = ROLE_PERMISSIONS[userRole]
        return requiredPermissions.every(perm => userPermissions.includes(perm))
    },

    /**
     * Obtiene todos los permisos del usuario
     */
    getUserPermissions(user: AuthUser): Permission[] {
        const role = extractUserRole(user)
        return role ? ROLE_PERMISSIONS[role] : []
    }
}
```

---

## 🔄 Flujo de Autenticación y Autorización

### Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Usuario accede a una ruta (ej: /concepts/users/users-list)  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. SecureRoutes determina si es ruta pública o protegida        │
└────────────────────────────┬────────────────────────────────────┘
                             │
         ┌───────────────────┴───────────────────┐
         │                                       │
         ▼ (Pública)                            ▼ (Protegida)
┌──────────────────┐              ┌──────────────────────────────┐
│ Renderiza        │              │ 3. ProtectedRoute intercepta │
│ directamente     │              └──────────┬───────────────────┘
└──────────────────┘                         │
                                             ▼
                             ┌───────────────────────────────────┐
                             │ 4. Verifica autenticación         │
                             │    ¿Usuario está logueado?        │
                             └───────────┬───────────────────────┘
                                         │
                     ┌───────────────────┴───────────────────┐
                     │ NO                                    │ SÍ
                     ▼                                       ▼
         ┌────────────────────────┐         ┌──────────────────────────┐
         │ Redirect a /sign-in    │         │ 5. Extrae rol del usuario│
         │ (guarda URL original)  │         │    RBAC.extractUserRole()│
         └────────────────────────┘         └──────────┬───────────────┘
                                                        │
                                                        ▼
                                         ┌─────────────────────────────┐
                                         │ 6. ¿Es SUPERADMIN?          │
                                         └──────────┬──────────────────┘
                                                    │
                               ┌────────────────────┴────────────────┐
                               │ SÍ                                  │ NO
                               ▼                                     ▼
                   ┌────────────────────┐              ┌─────────────────────────┐
                   │ ACCESO CONCEDIDO   │              │ 7. Verifica roles       │
                   │ (bypass)           │              │    ¿Tiene rol requerido?│
                   └────────────────────┘              └──────────┬──────────────┘
                                                                   │
                                              ┌────────────────────┴────────────────┐
                                              │ NO                                  │ SÍ
                                              ▼                                     ▼
                                  ┌─────────────────────┐           ┌──────────────────────────┐
                                  │ Redirect a          │           │ 8. Verifica permisos     │
                                  │ /access-denied      │           │    ¿Tiene permisos?      │
                                  └─────────────────────┘           └──────────┬───────────────┘
                                                                                │
                                                           ┌────────────────────┴────────────┐
                                                           │ NO                              │ SÍ
                                                           ▼                                 ▼
                                               ┌─────────────────────┐       ┌───────────────────┐
                                               │ Redirect a          │       │ ACCESO CONCEDIDO  │
                                               │ /access-denied      │       │ Renderiza ruta    │
                                               └─────────────────────┘       └───────────────────┘
```

### Manejo de Redirecciones

#### 1. Usuario no autenticado

```typescript
// Si el usuario no está logueado
const pathName = location.pathname
const redirectUrl = pathName === '/' ? '' : `?${REDIRECT_URL_KEY}=${pathName}`

// Redirige a /auth/sign-in?redirectUrl=/concepts/users/users-list
return <Navigate to={`/auth/sign-in${redirectUrl}`} replace />
```

#### 2. Usuario sin permisos

```typescript
// Si el usuario no tiene el rol o permiso requerido
return <Navigate to="/access-denied" />
```

#### 3. Prevención de loops infinitos

```typescript
// Previene redirigir a /sign-in si ya estamos en /sign-in
if (!authenticated && !pathName.startsWith('/sign-in')) {
    return <Navigate to="/auth/sign-in" />
}

// Permite acceso a /access-denied incluso sin permisos (evita loop)
if (location.pathname === '/access-denied') {
    return <>{children}</>
}
```

---

## 💡 Ejemplos de Implementación

### Ejemplo 1: Ruta Solo para ADMIN y SUPERADMIN

```typescript
// src/configs/routes.config/conceptsRoute.ts

import { lazy } from 'react'
import { CONCEPTS_PREFIX_PATH } from '@/constants/route.constant'
import { Role } from '@/utils/rbac/types'
import type { Routes } from '@/@types/routes'

const conceptsRoute: Routes = [
    {
        key: 'concepts.customers.customerList',
        path: `${CONCEPTS_PREFIX_PATH}/users/users-list`,
        component: lazy(() => import('@/views/concepts/customers/CustomerList')),
        
        // ✅ Solo ADMIN y SUPERADMIN pueden acceder
        roles: [Role.ADMIN, Role.SUPERADMIN],
        
        meta: {
            pageContainerType: 'contained',
        },
    },
]
```

### Ejemplo 2: Ruta con Permisos Granulares

```typescript
// Requiere permiso específico para ver y crear usuarios

const conceptsRoute: Routes = [
    {
        key: 'concepts.users.create',
        path: `${CONCEPTS_PREFIX_PATH}/users/create`,
        component: lazy(() => import('@/views/concepts/users/UserCreate')),
        
        // ✅ Usuario debe tener estos permisos
        permissions: [Permission.VIEW_USERS, Permission.CREATE_USER],
        
        // ✅ Requiere AMBOS permisos (AND)
        requireAllPermissions: true,
        
        meta: {
            pageContainerType: 'contained',
        },
    },
]
```

### Ejemplo 3: Ruta con Permisos Alternativos (OR)

```typescript
// Usuario puede acceder si tiene AL MENOS UNO de los permisos

const conceptsRoute: Routes = [
    {
        key: 'concepts.dashboard',
        path: `${CONCEPTS_PREFIX_PATH}/dashboard`,
        component: lazy(() => import('@/views/concepts/Dashboard')),
        
        // ✅ Usuario necesita VER dashboard O VER usuarios
        permissions: [Permission.VIEW_DASHBOARD, Permission.VIEW_USERS],
        
        // ✅ Con al menos uno es suficiente (OR)
        requireAllPermissions: false,
        
        meta: {
            pageContainerType: 'contained',
        },
    },
]
```

### Ejemplo 4: Ruta Solo para SUPERADMIN

```typescript
const conceptsRoute: Routes = [
    {
        key: 'concepts.system.settings',
        path: `${CONCEPTS_PREFIX_PATH}/system/settings`,
        component: lazy(() => import('@/views/concepts/system/Settings')),
        
        // ✅ Solo SUPERADMIN
        roles: [Role.SUPERADMIN],
        
        meta: {
            pageContainerType: 'contained',
        },
    },
]
```

### Ejemplo 5: Ruta Pública (Sin Protección)

```typescript
// src/configs/routes.config/authRoute.ts

const authRoute: Routes = [
    {
        key: 'signIn',
        path: `/auth/sign-in`,
        component: lazy(() => import('@/views/auth/SignIn')),
        
        // ✅ Array vacío = ruta pública, sin restricciones
        authority: [],
    },
]

export default authRoute
```

### Ejemplo 6: Ruta con Roles Y Permisos Combinados

```typescript
const conceptsRoute: Routes = [
    {
        key: 'concepts.users.delete',
        path: `${CONCEPTS_PREFIX_PATH}/users/delete/:id`,
        component: lazy(() => import('@/views/concepts/users/UserDelete')),
        
        // ✅ Debe ser ADMIN o SUPERADMIN
        roles: [Role.ADMIN, Role.SUPERADMIN],
        
        // ✅ Y debe tener permiso de eliminar usuarios
        permissions: [Permission.DELETE_USER],
        requireAllPermissions: true,
        
        meta: {
            pageContainerType: 'contained',
        },
    },
]
```

### Ejemplo 7: Protección en Componentes (No en Rutas)

A veces necesitas ocultar elementos dentro de un componente según permisos:

```typescript
// src/views/concepts/users/UserList.tsx

import { RBAC } from '@/utils/rbac'
import { Permission } from '@/utils/rbac/types'
import { useAuth } from '@/auth'
import Button from '@/components/ui/Button'

const UserList = () => {
    const { user } = useAuth()

    // ✅ Verificar permiso en el componente
    const canCreateUser = RBAC.hasPermission(user, Permission.CREATE_USER)
    const canDeleteUser = RBAC.hasPermission(user, Permission.DELETE_USER)

    return (
        <div>
            <h1>Lista de Usuarios</h1>

            {/* Botón solo visible si tiene permiso */}
            {canCreateUser && (
                <Button onClick={handleCreate}>
                    Crear Usuario
                </Button>
            )}

            <UserTable>
                {users.map(user => (
                    <UserRow key={user.id}>
                        <UserInfo user={user} />
                        
                        {/* Botón de eliminar solo si tiene permiso */}
                        {canDeleteUser && (
                            <Button 
                                variant="danger" 
                                onClick={() => handleDelete(user.id)}
                            >
                                Eliminar
                            </Button>
                        )}
                    </UserRow>
                ))}
            </UserTable>
        </div>
    )
}
```

### Ejemplo 8: Componente AuthorityCheck (Wrapper de Permisos)

```typescript
// src/components/shared/AuthorityCheck.tsx

import { ReactNode } from 'react'
import { useAuth } from '@/auth'
import { RBAC } from '@/utils/rbac'
import { Permission, Role } from '@/utils/rbac/types'

interface AuthorityCheckProps {
    children: ReactNode
    roles?: Role[]
    permissions?: Permission[]
    requireAllPermissions?: boolean
    fallback?: ReactNode  // Qué mostrar si no tiene acceso
}

/**
 * Componente que muestra u oculta contenido según permisos
 * 
 * @example
 * <AuthorityCheck permissions={[Permission.EDIT_USER]}>
 *   <EditButton />
 * </AuthorityCheck>
 */
const AuthorityCheck = ({ 
    children, 
    roles, 
    permissions,
    requireAllPermissions = true,
    fallback = null 
}: AuthorityCheckProps) => {
    const { user } = useAuth()

    // SUPERADMIN siempre tiene acceso
    if (RBAC.isSuperAdmin(user)) {
        return <>{children}</>
    }

    // Verificar roles
    if (roles && roles.length > 0) {
        if (!RBAC.hasAnyRole(user, roles)) {
            return <>{fallback}</>
        }
    }

    // Verificar permisos
    if (permissions && permissions.length > 0) {
        const hasPermission = requireAllPermissions
            ? RBAC.hasAllPermissions(user, permissions)
            : RBAC.hasAnyPermission(user, permissions)
        
        if (!hasPermission) {
            return <>{fallback}</>
        }
    }

    return <>{children}</>
}

export default AuthorityCheck
```

**Uso del componente:**

```typescript
import AuthorityCheck from '@/components/shared/AuthorityCheck'
import { Permission } from '@/utils/rbac/types'

const UserProfile = () => {
    return (
        <div>
            <h1>Perfil de Usuario</h1>
            
            {/* Solo visible para quien puede editar */}
            <AuthorityCheck permissions={[Permission.EDIT_USER]}>
                <Button>Editar Perfil</Button>
            </AuthorityCheck>

            {/* Solo visible para ADMIN o SUPERADMIN */}
            <AuthorityCheck roles={[Role.ADMIN, Role.SUPERADMIN]}>
                <AdminPanel />
            </AuthorityCheck>

            {/* Con fallback */}
            <AuthorityCheck 
                permissions={[Permission.VIEW_SETTINGS]}
                fallback={<p>No tienes acceso a esta sección</p>}
            >
                <SettingsPanel />
            </AuthorityCheck>
        </div>
    )
}
```

---

## ✅ Mejores Prácticas

### 1. 🎯 Preferir Sistema RBAC sobre Authority Legacy

```typescript
// ❌ EVITAR - Sistema legacy
{
    key: 'myRoute',
    path: '/my-route',
    component: MyComponent,
    authority: ['admin', 'user'],  // Deprecated
}

// ✅ RECOMENDADO - Sistema RBAC
{
    key: 'myRoute',
    path: '/my-route',
    component: MyComponent,
    roles: [Role.ADMIN, Role.SUPERADMIN],
    permissions: [Permission.VIEW_DASHBOARD],
}
```

### 2. 🔐 Siempre Validar Permisos en Backend

```typescript
// ⚠️ La protección del frontend es solo UX
// El backend SIEMPRE debe verificar permisos

// Frontend
const handleDelete = async (userId: string) => {
    // Frontend verifica antes de hacer la petición
    if (!RBAC.hasPermission(user, Permission.DELETE_USER)) {
        toast.error('No tienes permiso para eliminar usuarios')
        return
    }

    // Petición al backend
    await apiDeleteUser(userId)  // Backend TAMBIÉN verifica permisos
}
```

### 3. 📦 Organizar Rutas por Módulo

```typescript
// src/configs/routes.config/usersRoute.ts

import { CONCEPTS_PREFIX_PATH } from '@/constants/route.constant'
import { Role, Permission } from '@/utils/rbac/types'

const usersRoute: Routes = [
    // Listar usuarios
    {
        key: 'users.list',
        path: `${CONCEPTS_PREFIX_PATH}/users`,
        component: lazy(() => import('@/views/users/UserList')),
        roles: [Role.ADMIN, Role.SUPERADMIN],
        permissions: [Permission.VIEW_USERS],
    },

    // Crear usuario
    {
        key: 'users.create',
        path: `${CONCEPTS_PREFIX_PATH}/users/create`,
        component: lazy(() => import('@/views/users/UserCreate')),
        roles: [Role.ADMIN, Role.SUPERADMIN],
        permissions: [Permission.CREATE_USER],
    },

    // Editar usuario
    {
        key: 'users.edit',
        path: `${CONCEPTS_PREFIX_PATH}/users/edit/:id`,
        component: lazy(() => import('@/views/users/UserEdit')),
        roles: [Role.ADMIN, Role.SUPERADMIN, Role.SUBADMIN],
        permissions: [Permission.EDIT_USER],
    },

    // Eliminar usuario
    {
        key: 'users.delete',
        path: `${CONCEPTS_PREFIX_PATH}/users/delete/:id`,
        component: lazy(() => import('@/views/users/UserDelete')),
        roles: [Role.ADMIN, Role.SUPERADMIN],
        permissions: [Permission.DELETE_USER],
    },
]

export default usersRoute
```

### 4. 🧪 Testear Diferentes Roles

```typescript
// Crear usuarios de prueba con diferentes roles

const testUsers = {
    superadmin: {
        email: 'superadmin@test.com',
        role_id: 1,  // SUPERADMIN
    },
    admin: {
        email: 'admin@test.com',
        role_id: 2,  // ADMIN
    },
    subadmin: {
        email: 'subadmin@test.com',
        role_id: 6,  // SUBADMIN
    },
}

// Probar cada flujo con cada rol
```

### 5. 🚨 Manejo de Errores

```typescript
// src/components/rbac/ProtectedRoute.tsx

const ProtectedRoute = ({ children, roles, permissions }) => {
    const { user } = useAuth()

    try {
        // Validación con logs
        console.log('[ProtectedRoute] Validando acceso:', {
            user: user?.email,
            requiredRoles: roles,
            requiredPermissions: permissions,
            userRole: RBAC.extractUserRole(user),
        })

        // ... lógica de validación

    } catch (error) {
        console.error('[ProtectedRoute] Error en validación:', error)
        
        // Redirigir a página de error
        return <Navigate to="/error" />
    }
}
```

### 6. 📝 Documentar Rutas con Comentarios

```typescript
const conceptsRoute: Routes = [
    {
        /**
         * RUTA: Gestión de usuarios - Lista
         * 
         * ROLES PERMITIDOS:
         * - SUPERADMIN: Acceso total
         * - ADMIN: Puede ver todos los usuarios de su comunidad
         * 
         * PERMISOS REQUERIDOS:
         * - VIEW_USERS: Necesario para ver la lista
         * 
         * NOTAS:
         * - SUBADMIN NO tiene acceso a esta vista
         * - Implementa paginación server-side
         */
        key: 'users.list',
        path: `${CONCEPTS_PREFIX_PATH}/users`,
        component: lazy(() => import('@/views/users/UserList')),
        roles: [Role.ADMIN, Role.SUPERADMIN],
        permissions: [Permission.VIEW_USERS],
    },
]
```

### 7. 🔄 Mantener Sincronizados Permisos y Rutas

```typescript
// ✅ Buena práctica: Crear constantes para grupos de permisos

// src/utils/rbac/permissionGroups.ts

export const USER_MANAGEMENT_PERMISSIONS = [
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.EDIT_USER,
    Permission.DELETE_USER,
] as const

export const CONDO_MANAGEMENT_PERMISSIONS = [
    Permission.VIEW_CONDOS,
    Permission.CREATE_CONDO,
    Permission.EDIT_CONDO,
    Permission.DELETE_CONDO,
] as const

// Usar en rutas
{
    key: 'users.management',
    path: '/users',
    component: UserManagement,
    permissions: USER_MANAGEMENT_PERMISSIONS,
    requireAllPermissions: false,  // Con uno es suficiente
}
```

---

## 🐛 Troubleshooting

### Problema 1: Usuario Con Rol Correcto No Puede Acceder

**Síntomas:**

- Usuario tiene el rol pero es redirigido a `/access-denied`
- Console muestra "No se encontró un rol válido"

**Solución:**

```typescript
// Verificar estructura del usuario
console.log('Usuario completo:', user)

// Verificar que tenga role_id o role
if (!user.role_id && !user.role) {
    // Problema: Usuario no tiene rol asignado
    // Revisar respuesta del endpoint /me o /auth/login
}

// Verificar mapeo en rbacCore.ts
// ¿El role_id coincide con ROLE_IDS?
console.log('ROLE_IDS:', ROLE_IDS)
console.log('User role_id:', user.role_id)
```

### Problema 2: Loop Infinito de Redirecciones

**Síntomas:**

- Usuario es redirigido constantemente entre rutas
- Console muestra múltiples navegaciones

**Solución:**

```typescript
// Verificar prevención de loops en ProtectedRoute
const isAccessDeniedPage = location.pathname === '/access-denied'

if (isAccessDeniedPage) {
    return <>{children}</>  // Permitir acceso a /access-denied
}

// Verificar que /access-denied NO requiera roles
{
    key: 'accessDenied',
    path: '/access-denied',
    component: AccessDenied,
    roles: [],  // ✅ Sin roles = público
}
```

### Problema 3: SUPERADMIN No Tiene Acceso

**Síntomas:**

- Usuario con rol SUPERADMIN es denegado
- `RBAC.isSuperAdmin()` retorna false

**Solución:**

```typescript
// Verificar detección de SUPERADMIN
const role = RBAC.extractUserRole(user)
console.log('Rol extraído:', role)
console.log('Es SUPERADMIN:', role === Role.SUPERADMIN)

// Verificar role_id
if (user.role_id !== ROLE_IDS.SUPERADMIN) {
    // Problema: role_id incorrecto
    console.error('Expected role_id:', ROLE_IDS.SUPERADMIN)
    console.error('Actual role_id:', user.role_id)
}

// Verificar allowSuperAdmin en ProtectedRoute
<ProtectedRoute
    roles={[Role.ADMIN]}
    allowSuperAdmin={true}  // ✅ Debe ser true
>
```

### Problema 4: Permisos No Se Verifican Correctamente

**Síntomas:**

- Usuario con permiso es denegado
- `RBAC.hasPermission()` retorna false

**Solución:**

```typescript
// Verificar ROLE_PERMISSIONS
console.log('Permisos del rol:', ROLE_PERMISSIONS[Role.ADMIN])

// Verificar que el permiso esté en el enum
console.log('Permiso requerido:', Permission.VIEW_USERS)

// Verificar que el permiso esté en ROLE_PERMISSIONS
const userPermissions = RBAC.getUserPermissions(user)
console.log('Permisos del usuario:', userPermissions)
console.log('¿Tiene permiso?', userPermissions.includes(Permission.VIEW_USERS))
```

### Problema 5: Rutas Públicas Requieren Autenticación

**Síntomas:**

- Rutas como `/auth/sign-in` piden autenticación
- No se puede acceder a login

**Solución:**

```typescript
// Verificar que la ruta esté en publicRoutes
// src/configs/routes.config/routes.config.ts

export const publicRoutes: Routes = [
    ...authRoute,  // ✅ authRoute debe estar aquí
]

export const protectedRoutes: Routes = [
    ...dashboardsRoute,
    ...conceptsRoute,
    // ❌ authRoute NO debe estar aquí
]
```

### Problema 6: AuthProvider No Detecta Usuario

**Síntomas:**

- `useAuth()` retorna `user: null` aunque esté logueado
- Token existe en localStorage pero usuario no se carga

**Solución:**

```typescript
// Verificar que AuthProvider envuelva la aplicación
// src/main.tsx

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthProvider>  {/* ✅ Debe estar aquí */}
            <App />
        </AuthProvider>
    </React.StrictMode>
)

// Verificar que se llame a apiGetMe después del login
// src/auth/AuthProvider.tsx

const signIn = async (credentials) => {
    const response = await apiSignIn(credentials)
    
    // ✅ Cargar usuario después del login
    const userResponse = await apiGetMe()
    setUser(userResponse.data)
}
```

---

## 📚 Checklist de Implementación de Nueva Ruta

### ✅ Checklist Completo

```markdown
## Nueva Ruta: [Nombre de la Ruta]

### 1. Definición de Requisitos
- [ ] Determinar qué roles pueden acceder (SUPERADMIN, ADMIN, SUBADMIN)
- [ ] Determinar qué permisos se necesitan (VIEW, CREATE, EDIT, DELETE)
- [ ] Decidir si se requieren TODOS los permisos (AND) o AL MENOS UNO (OR)

### 2. Crear Permisos (Si no existen)
- [ ] Agregar nuevos permisos a `src/utils/rbac/types.ts` (enum Permission)
- [ ] Agregar permisos a `ROLE_PERMISSIONS` para cada rol

### 3. Crear Componente
- [ ] Crear componente de la vista en `src/views/`
- [ ] Implementar lógica de permisos dentro del componente (si es necesario)

### 4. Definir Ruta
- [ ] Agregar ruta al archivo correspondiente en `src/configs/routes.config/`
- [ ] Especificar `key`, `path`, `component`
- [ ] Especificar `roles` (si aplica)
- [ ] Especificar `permissions` (si aplica)
- [ ] Especificar `requireAllPermissions` (default: true)
- [ ] Configurar `meta` (layout, header, etc.)

### 5. Agregar a Navegación (Opcional)
- [ ] Agregar entrada en `src/configs/navigation.config/`
- [ ] Especificar roles que pueden ver el item del menú

### 6. Testing
- [ ] Probar acceso con SUPERADMIN ✅
- [ ] Probar acceso con ADMIN ✅
- [ ] Probar acceso con SUBADMIN ✅
- [ ] Probar acceso sin autenticación (debería redirigir a login) ✅
- [ ] Probar acceso con rol no permitido (debería redirigir a access-denied) ✅

### 7. Documentación
- [ ] Agregar comentarios explicativos en la definición de la ruta
- [ ] Actualizar este documento si es necesario
```

---

## 🎓 Recursos Adicionales

### Archivos Clave para Revisar

1. **Sistema RBAC:**
   - `src/utils/rbac/rbacCore.ts` - Lógica principal
   - `src/utils/rbac/types.ts` - Definición de roles y permisos
   - `src/constants/roles.constant.ts` - Constantes de roles

2. **Componentes de Routing:**
   - `src/components/rbac/SecureRoutes.tsx` - Router principal
   - `src/components/rbac/ProtectedRoute.tsx` - Guard RBAC
   - `src/components/route/ProtectedRoute.tsx` - Guard básico

3. **Configuración de Rutas:**
   - `src/configs/routes.config/routes.config.ts` - Combinador de rutas
   - `src/configs/routes.config/authRoute.ts` - Rutas públicas
   - `src/configs/routes.config/conceptsRoute.ts` - Rutas protegidas

4. **Autenticación:**
   - `src/auth/AuthProvider.tsx` - Proveedor de contexto
   - `src/auth/AuthContext.tsx` - Contexto de autenticación
   - `src/services/AuthService.ts` - Servicios de API

### Comandos Útiles

```bash
# Buscar todas las rutas protegidas
grep -r "roles:" src/configs/routes.config/

# Buscar uso de permisos
grep -r "Permission\." src/

# Buscar componentes que usan RBAC
grep -r "RBAC\." src/

# Ver estructura de ROLE_PERMISSIONS
cat src/utils/rbac/types.ts | grep -A 100 "ROLE_PERMISSIONS"
```

---

## 📝 Notas Finales

### Migración de Sistema Legacy a RBAC

Si tienes rutas que usan el sistema `authority` legacy:

```typescript
// ❌ Sistema Legacy
{
    key: 'myRoute',
    path: '/my-route',
    component: MyComponent,
    authority: ['admin', 'user'],
}

// ✅ Migrar a RBAC
{
    key: 'myRoute',
    path: '/my-route',
    component: MyComponent,
    roles: [Role.ADMIN, Role.SUBADMIN],  // Más explícito
    permissions: [Permission.VIEW_DASHBOARD],  // Más granular
}
```

### Consideraciones de Performance

- Las rutas se cargan con `lazy()` para code-splitting
- La verificación de permisos es síncrona (no afecta performance)
- AuthProvider usa SWR para cachear el usuario

### Seguridad

- ⚠️ **IMPORTANTE:** El frontend es solo UX. La seguridad real está en el backend.
- Siempre validar permisos en el backend antes de ejecutar acciones
- No confiar en el rol/permisos del cliente
- Implementar rate limiting y validación en API

---

## 📖 Cómo Usar Esta Documentación

### 🎯 Propósito de Este Documento

Esta guía es tu **referencia completa** para trabajar con el sistema de protección de rutas. Úsala cuando:

- ✅ Necesites agregar una nueva página protegida al proyecto
- ✅ Quieras entender por qué un usuario no puede acceder a cierta página
- ✅ Debas implementar botones o elementos que solo aparezcan para ciertos roles
- ✅ Necesites resolver problemas de redirecciones o acceso
- ✅ Quieras entender cómo está estructurado el sistema de seguridad

### 📚 Cómo Navegar Este Documento

El documento está organizado de **simple a complejo**:

1. **Empieza aquí si eres nuevo:** Lee primero [Explicación Simple](#explicación-simple---cómo-funciona-todo-esto)
2. **Para implementar rápido:** Ve directo a [Ejemplos de Implementación](#ejemplos-de-implementación)
3. **Para entender a fondo:** Lee [Arquitectura General](#arquitectura-general) y [Componentes de Protección](#componentes-de-protección)
4. **Cuando algo no funciona:** Consulta [Troubleshooting](#troubleshooting)
5. **Checklist al agregar rutas:** Usa [Checklist de Nueva Ruta](#checklist-de-implementación-de-nueva-ruta)

### 🆘 ¿Necesitas Ayuda?

Si después de leer esta guía aún tienes dudas:

1. Revisa los [ejemplos de código real](#ejemplos-de-implementación) del proyecto
2. Consulta la sección de [Troubleshooting](#troubleshooting)
3. Busca en el código archivos similares a lo que quieres hacer

---

## 🔗 Referencias Rápidas por Tarea

### Para Desarrolladores Frontend

| Necesito... | Ve a esta sección |
|-------------|-------------------|
| Crear una nueva página | [Ejemplo 1: Ruta Solo para ADMIN](#ejemplo-1-ruta-solo-para-admin-y-superadmin) |
| Ocultar un botón según permisos | [Ejemplo 7: Protección en Componentes](#ejemplo-7-protección-en-componentes-no-en-rutas) |
| Entender los roles disponibles | [Jerarquía de Roles](#jerarquía-de-roles) |
| Ver lista de permisos | [Sistema de Permisos Granulares](#sistema-de-permisos-granulares) |

### Para Debugging

| Problema | Solución |
|----------|----------|
| Usuario no puede acceder | [Problema 1: Usuario Con Rol Correcto No Puede Acceder](#problema-1-usuario-con-rol-correcto-no-puede-acceder) |
| Redirecciones infinitas | [Problema 2: Loop Infinito de Redirecciones](#problema-2-loop-infinito-de-redirecciones) |
| SUPERADMIN sin acceso | [Problema 3: SUPERADMIN No Tiene Acceso](#problema-3-superadmin-no-tiene-acceso) |
| Permisos no funcionan | [Problema 4: Permisos No Se Verifican Correctamente](#problema-4-permisos-no-se-verifican-correctamente) |

### Archivos Importantes del Proyecto

| Archivo | Qué Contiene |
|---------|--------------|
| `src/utils/rbac/types.ts` | Definición de roles y permisos |
| `src/components/rbac/ProtectedRoute.tsx` | Componente de protección principal |
| `src/configs/routes.config/` | Todas las rutas del proyecto |
| `src/utils/rbac/rbacCore.ts` | Lógica de verificación de permisos |
