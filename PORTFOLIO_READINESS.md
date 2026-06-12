# Locentr Enterprise Portfolio Readiness

## Estado actual

Locentr ya demuestra una base SaaS empresarial creíble:

- autenticación y sesión persistida de forma acotada;
- navegación y acciones protegidas por roles y permisos;
- empresas, subempresas, usuarios y edificios;
- control de accesos, auditoría, documentos, tickets y libro de novedades;
- métricas operativas;
- acceso policial público mediante QR;
- servicios alineados con `locentr-api`;
- interfaz responsive en español;
- validadores y errores de API compartidos;
- telemetría de errores, Web Vitals y request IDs sin datos sensibles;
- pruebas unitarias y E2E públicas;
- CI con lint, tipos, cobertura, build, auditoría y Playwright.

## P0: necesario antes de publicar la demo

1. **Aislamiento multiempresa en backend**

    - Aplicar autorización por recurso en empresas, usuarios, edificios, documentos, tickets y
      auditoría.
    - Un `ADMIN` nunca debe consultar datos de otra empresa usando un ID.
    - Rechazar `SUPERADMIN` en el endpoint de creación de usuarios.

2. **QR policial realmente de un solo uso**

    - Guardar `used_at` o estado consumido.
    - Consumir el token atómicamente en la primera solicitud válida.
    - Invalidar permisos anteriores al generar uno nuevo.
    - Guardar el hash del token, no el token plano.
    - Aplicar rate limiting y registrar generación, consumo y rechazo.

3. **Autenticación completa**

    - Verificar recuperación y cambio de contraseña de punta a punta.
    - Implementar renovación automática del access token o eliminar el refresh token almacenado si
      el backend no ofrece ese flujo.

4. **Archivos privados**

    - Añadir subida firmada de logos y documentos.
    - Validar MIME, tamaño, extensión y pertenencia de empresa en backend.
    - Servir descargas mediante URLs firmadas de corta duración.

5. **Demo desplegada**

    - Publicar frontend y API con datos semilla no sensibles.
    - Exponer Swagger/OpenAPI en una URL estable.
    - Añadir una cuenta demo por rol y un botón para reiniciar datos.

6. **Pruebas autenticadas contra la API**
    - La base unitaria cubre RBAC, validadores, errores y normalización de empresas.
    - Playwright cubre login público, recuperación, reset inválido y viewport móvil.
    - Faltan flujos E2E autenticados para cambio de empresa, creación de usuario, acceso y QR una
      vez que exista una API de prueba con datos semilla.

## P1: eleva el proyecto a nivel enterprise

- Observabilidad externa: conectar la telemetría frontend a un colector y correlacionarla con los
  request IDs del backend.
- Auditoría real en backend: actor, empresa, recurso, acción, fecha, IP y resultado.
- Accesibilidad: navegación por teclado, foco, contraste y pruebas automáticas.
- Contrato compartido: generar tipos frontend desde OpenAPI.
- Estados operativos: páginas 403, 404, mantenimiento y degradación de API.
- Rendimiento: dividir el bundle principal y definir presupuestos de tamaño.
- Exportaciones CSV/PDF con permisos y trazabilidad.
- Retención y privacidad para documentos y métricas demográficas.

## P2: solo si aporta a la historia del producto

- Facturación y planes.
- Invitaciones por correo.
- Webhooks e integraciones externas.
- SSO/SAML.
- Personalización avanzada por empresa.

Estas funciones no son necesarias para un portfolio fuerte si los flujos P0 están terminados,
probados y desplegados.

## Higiene de presentación

- Mantener `Locentr` como única identidad visible y técnica del producto.
- Añadir descripción, licencia y capturas al repositorio.
- Incluir un diagrama `Frontend -> API -> PostgreSQL -> Storage`.
- Documentar decisiones técnicas y amenazas mitigadas.
- Cerrar o actualizar issues antiguas que ya no representan el producto actual.

## Definición de terminado

La demo está lista para portfolio cuando:

1. cada rol puede completar su flujo principal sin datos mock;
2. un administrador no puede leer ni modificar otra empresa;
3. el QR policial se consume una sola vez;
4. documentos y logos se suben y descargan de forma privada;
5. CI ejecuta pruebas y build desde una instalación limpia;
6. frontend, API y Swagger están desplegados;
7. el README explica arquitectura, seguridad, credenciales demo y alcance.

## Decisión de alcance

El frontend ya tiene una base suficiente para portfolio y no necesita más módulos antes de avanzar
al backend. Las mejoras restantes del frontend dependen del contrato y de un entorno real: E2E
autenticado, tipos generados desde OpenAPI, almacenamiento privado y correlación de telemetría.
