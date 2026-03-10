"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Drawer, DrawerContent, DrawerHeader, DrawerBody } from "@heroui/drawer";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { DatePicker } from "@heroui/date-picker";
import { parseDate, getLocalTimeZone } from "@internationalized/date";
import { Calendar, Clock, User, FileText, X, Check, Pencil, Save, Undo2 } from "lucide-react";

import { useCalendarStore } from "../store/calendar-store";
import { createClient } from "@/utils/supabase/client";
import { CalendarEvent } from "@/types/types";
import { Divider } from "@heroui/divider";

interface EventSheetProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventSheet({ event, open, onOpenChange }: EventSheetProps) {
  const supabase = createClient();
  const { fetchEvents } = useCalendarStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState<Date | undefined>(undefined);
  const [editHora, setEditHora] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  // Al entrar en modo edición, cargamos los valores actuales
  const handleEnterEdit = () => {
    if (!event) return;
    const [y, m, d] = event.date.split("-").map(Number);
    setEditDate(new Date(y, m - 1, d));
    setEditHora(event.startTime);
    setEditNotes(event.description || "");
    setIsEditing(true);
  };

  const handleSaveChanges = async () => {
    if (!event || !editDate) return;
    setUpdating(true);
    
    const { error } = await supabase
      .from("reservas")
      .update({
        reserva_fecha: format(editDate, "yyyy-MM-dd"),
        reserva_hora: editHora,
        notas: editNotes
      })
      .eq("id", event.id);

    if (!error) {
      await fetchEvents();
      setIsEditing(false);
    } else {
      alert("Error al guardar: " + error.message);
    }
    setUpdating(false);
  };

  const updateStatus = async (status: "confirmado" | "cancelado" | "reservado") => {
    if (!event) return;
    setUpdating(true);
    const { error } = await supabase.from("reservas").update({ estado: status }).eq("id", event.id);
    if (!error) await fetchEvents();
    onOpenChange(false);
    setUpdating(false);
  };

  if (!event) return null;

  return (
    <Drawer isOpen={open} onOpenChange={onOpenChange} placement="right" size="sm">
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader className="px-6 py-6">
              <h2 className="text-xl font-bold">{isEditing ? "Editar Turno" : "Detalle de Reserva"}</h2>
            </DrawerHeader>

            <Divider orientation="horizontal" />

            <DrawerBody className="p-6 gap-6">
              {isEditing ? (
                <div className="flex flex-col gap-4">
                  <DatePicker
                    label="Fecha"
                    value={editDate ? parseDate(format(editDate, "yyyy-MM-dd")) : undefined}
                    onChange={(val) => setEditDate(val?.toDate(getLocalTimeZone()))}
                  />
                  <Input label="Hora" type="time" value={editHora} onValueChange={setEditHora} />
                  <Input label="Notas" value={editNotes} onValueChange={setEditNotes} />
                  <div className="flex gap-2 pt-4">
                    <Button fullWidth variant="bordered" onPress={() => setIsEditing(false)}>Cancelar</Button>
                    <Button fullWidth color="primary" isLoading={updating} onPress={handleSaveChanges}>Guardar</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="flex items-start gap-4">
                    <User className="size-5 mt-1 text-primary" />
                    <div>
                      <p className="text-xs text-default-500 uppercase font-bold">Paciente</p>
                      <p className="text-lg font-medium">{event.participants[0]}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock className="size-5 mt-1 text-primary" />
                    <div>
                      <p className="text-xs text-default-500 uppercase font-bold">Fecha y Hora</p>
                      <p className="text-base">
                        {format(new Date(event.date + "T00:00:00"), "EEEE d 'de' MMMM", { locale: es })}
                      </p>
                      <p className="text-base font-bold">{event.startTime} hs</p>
                    </div>
                  </div>
                  {event.description && (
                    <div className="flex items-start gap-4">
                      <FileText className="size-5 mt-1 text-primary" />
                      <div>
                        <p className="text-xs text-default-500 uppercase font-bold">Notas</p>
                        <p className="text-sm bg-default-100 p-3 rounded-lg italic">{event.description}</p>
                      </div>
                    </div>
                  )}
                  {!isEditing && <Button size="sm" color="primary" variant="flat" onPress={handleEnterEdit}><Pencil className="size-4" />Modificar Turno</Button>}

                  <Divider orientation="horizontal" />
                  <div className="flex flex-col gap-5">
                    <p className="text-lg font-medium">Asignar estado a la reserva</p>
                    <div className="mt-auto grid grid-cols-2 gap-2">
                      <Button color="success" variant="flat" onPress={() => updateStatus("confirmado")}>Confirmar</Button>
                      <Button color="danger" variant="flat" onPress={() => updateStatus("cancelado")}>Cancelar</Button>
                    </div>
                  </div>
                </div>
              )}
            </DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}