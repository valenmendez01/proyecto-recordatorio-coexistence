// app/api/whatsapp/webhooks/kapso/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // 1. Validar el secreto desde los headers
    const incomingSecret = req.headers.get("x-webhook-secret");
    const environmentSecret = process.env.KAPSO_WEBHOOK_SECRET;

    if (!incomingSecret || incomingSecret !== environmentSecret) {
      console.error("❌ Intento de acceso no autorizado al webhook");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { event, data } = body;

    // 2. Procesar el evento oficial de Kapso
    if (event === "whatsapp.phone_number.created") {
      const { external_customer_id, id: phoneNumberId } = data;

      const { error } = await supabaseAdmin
        .from("perfiles")
        .update({ 
          whatsapp_status: "connected",
          whatsapp_phone_number_id: phoneNumberId 
        })
        .eq("id", external_customer_id);

      if (error) throw error;
      console.log(`✅ Conexión exitosa guardada para: ${external_customer_id}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error en Webhook:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}