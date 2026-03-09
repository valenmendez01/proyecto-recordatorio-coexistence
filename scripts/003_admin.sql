-- 1. Crea el usuario en Auth: Ve a tu Dashboard de Supabase -> Authentication -> Users -> Add User. Crea tu cuenta con email y contraseña.

-- 2. Copia el ID: Una vez creado, copia el User UID (un código como a1b2c3d4...).

-- 3. Vincula el Admin en SQL: Ejecuta el siguiente script en el SQL Editor reemplazando el ID:
INSERT INTO public.perfiles (id, email, role)
VALUES (
  'AQUÍ_PEGA_TU_UID', -- Ejemplo: 'd7a123-...'
  'tu-email@ejemplo.com', 
  'admin'
);