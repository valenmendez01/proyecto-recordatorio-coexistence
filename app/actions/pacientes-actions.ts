"use server";

import { createClient } from "@/utils/supabase/server";
import { PacienteInsert, PacienteUpdate } from "@/types/types";

export async function crearPacienteAction(nuevoPaciente: PacienteInsert) {
  const supabase = await createClient();
  
  const { error } = await supabase.from("pacientes").insert([nuevoPaciente]);

  if (error) return { error: error.message };
  
  return { success: true };
}

export async function actualizarPacienteAction(id: string, datosActualizados: PacienteUpdate) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("pacientes")
    .update(datosActualizados)
    .eq("id", id);

  if (error) return { error: error.message };

  return { success: true };
}

export async function eliminarPacienteAction(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.from("pacientes").delete().eq("id", id);
  
  if (error) return { error: error.message };

  return { success: true };
}