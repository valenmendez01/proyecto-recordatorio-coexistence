"use server";

import { createClient } from "@/utils/supabase/server";
import { ReservaInsert, ReservaUpdate } from "@/types/types";

export async function crearReservaAction(nuevaReserva: ReservaInsert) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado" };
  
  const { data, error } = await supabase
    .from("reservas")
    .insert([nuevaReserva])
    .select()
    .single();

  if (error) {
    console.error(error.message);

    return { error: "Error interno del servidor" };
  }

  return { success: true, data };
}

export async function actualizarReservaAction(id: string, datosActualizados: ReservaUpdate) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado" };
  
  const { error } = await supabase
    .from("reservas")
    .update(datosActualizados)
    .eq("id", id);

  if (error) {
    console.error(error.message);

    return { error: "Error interno del servidor" };
  }

  return { success: true };
}

export async function eliminarReservaAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado" };
  
  const { error } = await supabase.from("reservas").delete().eq("id", id);
  
  if (error) {
    console.error(error.message);
    
    return { error: "Error interno del servidor" };
  }

  return { success: true };
}