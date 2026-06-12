# Cierre final del frontend

Fecha de verificación: 11 de junio de 2026.

La fuente de verdad usada para contratos, roles y rutas fue el repositorio `NoisGit/locentr-api`. La
interfaz conserva `Edificios` como nombre de producto, pero usa `Locations` y `/api/v1/locations`
como dominio técnico.

## Recursos auditados

| Recurso   | Listado y paginación      | Detalle                             | Crear             | Editar            | Desactivar        |
| --------- | ------------------------- | ----------------------------------- | ----------------- | ----------------- | ----------------- |
| Empresas  | SUPERADMIN, ADMIN         | SUPERADMIN, ADMIN                   | SUPERADMIN        | SUPERADMIN, ADMIN | SUPERADMIN        |
| Edificios | SUPERADMIN, ADMIN, CLIENT | SUPERADMIN, ADMIN, OPERATOR, CLIENT | SUPERADMIN, ADMIN | SUPERADMIN, ADMIN | SUPERADMIN, ADMIN |
| Usuarios  | SUPERADMIN, ADMIN         | SUPERADMIN, ADMIN                   | SUPERADMIN, ADMIN | SUPERADMIN, ADMIN | SUPERADMIN        |

El panel no permite crear, asignar, editar ni desactivar cuentas `SUPERADMIN`. Esas cuentas quedan
fuera de la administración ordinaria del SaaS.

## Paginación

Empresas, Edificios, Usuarios, Documentos, Tickets, Auditoría, listas de acceso y registros de
acceso usan `page`, `size` y el `total` real entregado por la API. La búsqueda o un cambio de
alcance reinicia la página a 1. Las tablas no ofrecen ordenamiento cuando el endpoint no declara ese
contrato.

## Seguridad y UX

- Renovación automática del access token mediante `/api/v1/auth/refresh-access-token`, con un solo
  reintento por solicitud.
- Redirección de sesión expirada conserva una ruta interna codificada.
- Mensajes de API en español y sin filtrar detalles internos desconocidos.
- Validación previa de CSV por extensión, MIME, contenido y límite de 5 MB.
- IDs guardados en el navegador se consideran sugerencias y se validan contra los recursos
  autorizados por la API.
- Navegación y rutas coinciden con los roles del backend. Auditoría es exclusiva de `SUPERADMIN`;
  Tickets es para `SUPERADMIN` y `ADMIN`.
- No se encontraron secretos ni marcas heredadas activas en el código de producto.

## Pendientes del backend

Estos puntos no pueden resolverse de forma segura desde el navegador:

1. Empresas debe filtrar y autorizar por tenant en listado, detalle y edición para `ADMIN`; hoy el
   servicio puede exponer empresas ajenas.
2. Los esquemas de creación y edición deben rechazar `SUPERADMIN` también en la API, incluida la
   creación de usuarios dentro de una empresa.
3. `CompanyResponse` declara `parent_company_id`, pero el transformador del servicio no lo entrega.
4. La creación de un edificio responde sin ID y no lo asigna atómicamente a la empresa del
   administrador. Esto puede crear un edificio huérfano que el mismo administrador no logra volver a
   consultar.

El frontend bloquea los flujos inseguros que puede controlar, pero la API debe resolver estos cuatro
puntos antes de una puesta en producción multi-tenant.
