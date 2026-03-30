-- 1. Tabla de Perfiles
CREATE TABLE public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')),
  whatsapp_status TEXT DEFAULT 'disconnected' CHECK (whatsapp_status IN ('connected', 'disconnected')),
  whatsapp_customer_id TEXT,
  whatsapp_phone_number_id TEXT,
  whatsapp_access_token TEXT
);

-- 2. Tabla de Pacientes (Multi-tenant)
CREATE TABLE public.pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  dni VARCHAR(20) UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  telefono TEXT NOT NULL CHECK (telefono ~ '^\+?[1-9]\d{1,14}$'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(perfil_id, dni)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_pacientes_perfil_dni ON public.pacientes(perfil_id, dni);

-- Habilitamos RLS
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario lee su propio perfil" ON public.perfiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuario actualiza su propio perfil" ON public.perfiles FOR UPDATE USING (auth.uid() = id);

-- Función para verificar si eres admin
CREATE OR REPLACE FUNCTION public.es_admin()
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $$
  BEGIN
    RETURN EXISTS (
      SELECT 1 FROM public.perfiles 
      WHERE id = auth.uid() AND role = 'admin'
    );
  END;
$$;

-- Habilitar RLS
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

-- Política que combina Rol + Propiedad
CREATE POLICY "Profesional gestiona sus propios pacientes" 
  ON public.pacientes FOR ALL 
  USING (es_admin() AND auth.uid() = perfil_id)
  WITH CHECK (es_admin() AND auth.uid() = perfil_id);