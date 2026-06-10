# Preparación enterprise

## Implementado

- Autenticación, sesión temporal, roles y permisos.
- Empresas, edificios, usuarios, documentos, accesos, auditoría y tickets.
- Dashboard conectado a métricas operativas de la API.
- Tickets con historial de respuestas.
- Navegación canónica en inglés y etiquetas de negocio en español.
- Cabeceras de seguridad y auditoría de dependencias.

## Siguiente prioridad

1. Slugs o UUID opacos en la API para reemplazar IDs técnicos en URLs compartibles.
2. Aislamiento multiempresa probado en cada endpoint y consulta.
3. Paginación y filtros uniformes en empresas, edificios, usuarios, documentos, auditoría y tickets.
4. Invitaciones, ciclo de vida de usuarios, MFA y recuperación segura de cuentas.
5. Gestión de planes, límites, facturación y consumo por empresa.
6. Exportaciones, retención, respaldo y recuperación ante desastres.
7. Alertas, notificaciones y acuerdos de nivel de servicio.
8. Observabilidad: errores, latencia, disponibilidad, trazas y métricas de negocio.
9. Privacidad: consentimiento, minimización, borrado y políticas de datos demográficos.
10. Pruebas E2E de los flujos críticos y pruebas de autorización entre empresas.

## Contrato de dominio recomendado

- `Company`: organización cliente.
- `Building`: edificio o sede operativa; actualmente la API lo denomina `Location`.
- `Membership`: relación entre usuario, empresa, rol y alcance.
- `AccessEvent`: entrada o salida de una persona.
- `SupportTicket`: solicitud con estados, responsables, comentarios y SLA.

La transición de `Location` a `Building` debe acordarse primero en el contrato OpenAPI para evitar traducciones
distintas entre frontend, backend y documentación.
