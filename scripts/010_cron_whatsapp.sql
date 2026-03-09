-- 1. Habilitar la extensión si no está activa
create extension if not exists pg_net;
create extension if not exists pg_cron;

-- 2. Crear el trabajo (Job)
-- Se ejecuta todos los domingos (0) a las 12:00 UTC (9 AM AR)
select
  cron.schedule(
    'send-sunday-reminders', -- nombre del job
    '0 12 * * 0',            -- cron syntax (min hora dia mes dia_sem)
    $$
    select
      net.http_get(
          -- CAMBIA ESTO POR TU URL DE PRODUCCIÓN REAL
          url:='https://v0-four-step-booking-system.vercel.app/api/whatsapp/send-reminders',
          headers:='{"Authorization": "Bearer f67890123456789abcde"}'::jsonb
      ) as request_id;
    $$
  );

-- Para ejecutar en el momento (test):
-- SELECT
--   net.http_get(
--       url:='https://v0-four-step-booking-system.vercel.app/api/whatsapp/send-reminders',
--       headers:='{"Authorization": "Bearer f67890123456789abcde"}'::jsonb
--   ) as request_id;