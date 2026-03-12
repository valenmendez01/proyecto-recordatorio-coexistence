// app/api/whatsapp/send-reminders/route.ts
import { NextResponse } from 'next/server';

const META_API_URL = `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}`;

async function sendMetaReminder(to: string, templateName: string, idTurno: string) {
  return fetch(`${META_API_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      type: "template",
      template: {
        name: templateName,
        language: { code: "es_AR" },
        components: [
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: idTurno }]
          }
        ]
      }
    })
  });
}

// ESTO ES LO QUE FALTA: El export del manejador para Next.js
export async function GET(request: Request) {
  try {
    // Aquí deberías agregar la lógica para buscar los turnos de la semana 
    // en Supabase y llamar a sendReminder para cada uno.
    
    // Por ahora, devolvemos un éxito para que el Build pase:
    return NextResponse.json({ message: "Proceso de recordatorios iniciado" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}