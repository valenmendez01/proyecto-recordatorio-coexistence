"use server";

import { createClient } from "@/utils/supabase/server";
import { ReservaInsert, ReservaUpdate } from "@/types/types";

export async function crearReservaAction(nuevaReserva: ReservaInsert) {
  const supabase = await createClient();
  
  // Usamos .select().single() porque necesitamos el ID generado 
  // para poder enviarle el WhatsApp inmediatamente después
  const { data, error } = await supabase
    .from("reservas")
    .insert([nuevaReserva])
    .select()
    .single();

  if (error) return { error: error.message };
  
  return { success: true, data };
}

export async function actualizarReservaAction(id: string, datosActualizados: ReservaUpdate) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("reservas")
    .update(datosActualizados)
    .eq("id", id);

  if (error) return { error: error.message };

  return { success: true };
}

export async function eliminarReservaAction(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.from("reservas").delete().eq("id", id);
  
  if (error) return { error: error.message };

  return { success: true };
}