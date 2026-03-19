import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { completeOnboarding } from "@/app/meta-actions";

/** URL de fallback para todas las redirecciones */
const REDIRECT_URL = "/configuracion";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const code = searchParams.get("code");
  const metaError = searchParams.get("error");

  // 1. Manejo de errores de Meta
  if (metaError || !code) {
    return NextResponse.redirect(
      new URL(`${REDIRECT_URL}?whatsapp_error=cancelled`, req.url)
    );
  }

  // 2. Verificar sesión del usuario
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL(`${REDIRECT_URL}?whatsapp_error=unauthenticated`, req.url)
    );
  }

  try {
    /* IMPORTANTE: Para que esta ruta funcione por sí sola (si hay redirección), 
      necesitaríamos capturar también el WABA_ID y PHONE_ID desde la URL. 
      
      Sin embargo, como ahora lo manejamos todo desde el popup con 'completeOnboarding' 
      en la página de configuración, esta ruta sirve principalmente como 
      un respaldo o para limpiezas.
    */

    // Si decides mantener esta ruta como flujo principal, Meta debe enviar los IDs en la URL.
    const wabaId = searchParams.get("setup_wizard_id"); // Meta suele enviarlo así en redirecciones
    const phoneNumberId = searchParams.get("selected_number_id");

    if (code && wabaId && phoneNumberId) {
      // Ejecutamos los 3 pasos: Intercambio, Webhooks y Registro
      const result = await completeOnboarding(code, wabaId, phoneNumberId);
      
      if (result.error) throw new Error(result.error);
    }

    return NextResponse.redirect(
      new URL(`${REDIRECT_URL}?whatsapp_success=true`, req.url)
    );

  } catch (error: any) {
    console.error("[whatsapp/success] Error en onboarding:", error.message);
    return NextResponse.redirect(
      new URL(`${REDIRECT_URL}?whatsapp_error=onboarding_failed`, req.url)
    );
  }
}