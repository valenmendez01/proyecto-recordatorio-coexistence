CREATE TABLE public.plantillas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  nombre_meta TEXT NOT NULL, -- El nombre que se envía a Meta (ej: recordatorio_cita)
  header_text TEXT,
  body_text TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.plantillas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin gestiona sus plantillas" 
  ON public.plantillas FOR ALL USING (es_admin());