-- Configuración en Supabase: Integrations > Habilitar Cron
-- Jobs > Create Job

Name: cleanup-old-notifications-logs
Schedule: 0 0 1 * *
Type: HTTP Request. Send an HTTP request to any URL.
Method: DELETE
Endpoint URL: https://url_de_la_app/api/admin/cleanup/logs
Timeout: 5000 ms
HTTP Headers:
  Header name: Authorization
  Header value: Bearer codigo_secreto_para_el_cron_job
HTTP Request Body: dejarlo vacío


-- Explicación lógica:
-- Al ejecutarse el día 1 de cada mes (ej. 1 de Mayo), el endpoint debe eliminar 
-- registros cuya fecha sea anterior al inicio del mes previo (ej. anterior al 1 de Marzo), 
-- cumpliendo con tu regla de eliminar el "mes anterior al anterior".