CREATE TABLE public.notificaciones_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  reserva_id UUID REFERENCES public.reservas(id) ON DELETE SET NULL,
  paciente_nombre TEXT, -- Guardamos el nombre por si se borra la reserva
  tipo TEXT NOT NULL, -- 'reserva', 'recordatorio', 'actualizacion'
  estado TEXT NOT NULL, -- 'success', 'error', 'delivered', 'read'
  mensaje_error TEXT,
  meta_message_id TEXT, -- ID que devuelve Meta para rastrear en el webhook
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Solo lectura para el admin)
ALTER TABLE public.notificaciones_log ENABLE ROW LEVEL SECURITY;

-- Solo lectura para el dueño (Rol + Propiedad)
CREATE POLICY "Profesional ve sus propios logs" 
  ON public.notificaciones_log FOR SELECT 
  USING (es_admin() AND auth.uid() = perfil_id);

-- Inserción permitida para el sistema (Service Role o procesos internos)
CREATE POLICY "Sistema inserta logs" 
  ON public.notificaciones_log FOR INSERT 
  WITH CHECK (true);