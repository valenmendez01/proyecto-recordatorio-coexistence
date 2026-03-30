"use server";

import { createClient } from "@/utils/supabase/server";
import { PacienteInsert, PacienteUpdate } from "@/types/types";

export async function crearPacienteAction(nuevoPaciente: PacienteInsert) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado" };
  
  const { error } = await supabase.from("pacientes").insert([{ ...nuevoPaciente, perfil_id: user.id }]);

  if (error) {
    console.error(error.message);

    return { error: "Error interno del servidor" };
  }
  
  return { success: true };
}

export async function actualizarPacienteAction(id: string, datosActualizados: PacienteUpdate) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado" };
  
  const { error } = await supabase
    .from("pacientes")
    .update(datosActualizados)
    .eq("id", id)
    .eq("perfil_id", user.id);

  if (error) {
    console.error(error.message);

    return { error: "Error interno del servidor" };
  }

  return { success: true };
}

export async function eliminarPacienteAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado" };
  
  const { error } = await supabase.from("pacientes").delete().eq("id", id).eq("perfil_id", user.id);
  
  if (error) {
    console.error(error.message);
    
    return { error: "Error interno del servidor" };
  }

  return { success: true };
}