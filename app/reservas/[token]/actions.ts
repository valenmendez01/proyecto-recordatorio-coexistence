"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@supabase/supabase-js";

// Cliente con service role — bypasea RLS intencionalmente.
// El token UUID actúa como credencial implícita del paciente.
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function confirmarReserva(token: string) {
  const supabase = await createServiceClient();

  await supabase
    .from("reservas")
    .update({ estado: "confirmado" })
    .eq("token", token)
    .eq("estado", "reservado");

  revalidatePath(`/reservas/${token}`);
}

export async function cancelarReserva(token: string) {
  const supabase = await createServiceClient();

  await supabase
    .from("reservas")
    .update({ estado: "cancelado" })
    .eq("token", token)
    .eq("estado", "reservado");

  revalidatePath(`/reservas/${token}`);
}