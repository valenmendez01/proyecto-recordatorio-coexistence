-- Configuración en Supabase: Integrations > Habilitar Cron
-- Jobs > Create Job

Name: cleanup-old-reservas
Schedule: 0 0 1 * *
Type: HTTP Request. Send an HTTP request to any URL.
Method: DELETE
Endpoint URL: https://url_de_la_app/api/admin/cleanup/reservas
Timeout: 5000 ms
HTTP Headers:
  Header name: Authorization
  Header value: Bearer codigo_secreto_para_el_cron_job
HTTP Request Body: dejarlo vacío


-- Nota de seguridad:
-- Asegúrate de que "codigo_secreto_para_el_cron_job" coincida con tu variable CRON_SECRET 
-- definida en el archivo .env.local para validar que la petición proviene de tu cron job.