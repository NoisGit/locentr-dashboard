# Seguridad de Locentr

## Alcance del frontend

- La sesión se guarda en `sessionStorage` para reducir persistencia en equipos compartidos.
- Las rutas y acciones se protegen por rol y permiso, pero el backend debe repetir cada validación.
- Las entradas de texto se normalizan, se limitan en longitud y se eliminan caracteres de control.
- Los identificadores internos no se muestran como información de negocio.
- Los enlaces externos usan `noopener` y `noreferrer`.
- El despliegue aplica CSP, protección contra iframes, MIME sniffing y una política restrictiva de
  permisos.
- Cada solicitud genera un `x-request-id` para correlacionar fallos con la API.
- La telemetría elimina tokens, contraseñas y cabeceras de autorización antes de enviar eventos.
- Un error de renderizado se contiene mediante un límite global sin exponer detalles internos al
  usuario.

## Controles obligatorios en `locentr-api`

La prevención real de SQL injection pertenece al backend:

1. Usar exclusivamente consultas parametrizadas u ORM. Nunca interpolar texto del usuario en SQL.
2. Validar cuerpos, query params y path params con esquemas estrictos y límites de longitud.
3. Aplicar autorización por recurso y por empresa en cada endpoint. Un ID válido no concede acceso.
4. Derivar `company_id` y permisos desde la sesión cuando sea posible; no confiar solo en headers
   del cliente.
5. Restringir ordenamiento y filtros a listas permitidas. Los nombres de columnas no deben venir
   libres desde la URL.
6. Añadir rate limiting a login, recuperación de contraseña, búsquedas, exportaciones y cargas.
7. Registrar intentos rechazados sin guardar contraseñas, tokens, documentos de identidad ni
   contenido sensible.
8. Mantener secretos fuera del repositorio y rotarlos por ambiente.
9. Ejecutar análisis de dependencias, SAST y pruebas de autorización multiempresa en CI.
10. Aceptar y propagar `x-request-id` en CORS, logs estructurados, respuestas y auditoría.

### Brechas actuales confirmadas en el contrato

- `list_companies` permite ADMIN, pero el servicio backend no filtra por la empresa del usuario.
- Los detalles de empresa y usuario aceptan un ID sin comprobar pertenencia multiempresa.
- La creación de usuarios permite recibir `SUPERADMIN`; el frontend lo bloquea, pero la API también
  debe rechazarlo.
- Storage devuelve URLs públicas de lectura, no destinos firmados para subir binarios.
- Los permisos policiales vencen después de 30 minutos, pero pueden reutilizarse durante ese
  período. El backend devuelve el permiso activo existente y no lo consume tras la primera visita.
  Un QR realmente de un solo uso requiere consumo atómico del token en `locentr-api`.

Estos controles deben resolverse en `locentr-api`; ocultar elementos en el frontend solo mejora la
experiencia.

## Identificadores y URLs

DDD no exige eliminar IDs del modelo. La interfaz debe usar nombres de dominio y mantener los IDs
como detalles internos. Para URLs públicas legibles, la API debe exponer un `slug` estable o un UUID
opaco para empresas, edificios, usuarios y tickets. No se deben fabricar slugs solo en el navegador
porque dejarían de funcionar al recargar o compartir un enlace.

## Datos demográficos

Las métricas de género se muestran únicamente de forma agregada. El backend debe definir
consentimiento, finalidad, retención y umbrales mínimos antes de exponer segmentos que puedan
identificar a una persona.
