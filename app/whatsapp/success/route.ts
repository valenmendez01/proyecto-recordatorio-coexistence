import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code"); // Meta envía un 'code'

  if (code) {
    // 1. Intercambiar el código por un Access Token usando el Graph API de Meta
    const res = await fetch(`https://graph.facebook.com/v20.0/oauth/access_token?client_id=${process.env.NEXT_PUBLIC_META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&code=${code}`);
    const data = await res.json();
    
    // 2. Guardar el token y el ID del número en Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && data.access_token) {
      await supabaseAdmin
        .from("perfiles")
        .update({ 
          whatsapp_status: "connected",
          // Aquí guardarías el token de Meta (cifrado preferiblemente)
          whatsapp_phone_number_id: "ID_DEL_NUMERO_EXTRAIDO_DE_META" 
        })
        .eq("id", user.id);
    }
  }

  return NextResponse.redirect(new URL("/configuracion", req.url));
}