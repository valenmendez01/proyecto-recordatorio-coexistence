import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const body = await req.json();
  
  // En coexistencia, capturar eventos de "echo" es vital
  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  
  if (message?.metadata?.display_phone_number) {
    // Aquí detectas si es un mensaje enviado desde el CELULAR (echo)
    // o una respuesta del cliente para actualizar tu base de datos
    console.log("Evento recibido:", message);
  }

  return NextResponse.json({ status: "ok" });
}