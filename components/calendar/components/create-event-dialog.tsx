"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { DatePicker } from "@heroui/date-picker";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { parseDate, getLocalTimeZone, today } from "@internationalized/date";
import {
  Clock,
  User,
  Search,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { useCalendarStore } from "../store/calendar-store";
import { createClient } from "@/utils/supabase/client"; // Usamos el cliente de navegador
import { Paciente } from "@/types/types";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateEventDialog({ open, onOpenChange }: CreateEventDialogProps) {
  const supabase = createClient();
  const { goToDate, fetchEvents } = useCalendarStore();

  // --- ESTADOS DEL FORMULARIO ---
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [hora, setHora] = useState("09:00"); // Valor por defecto
  const [dniCliente, setDniCliente] = useState("");
  const [clienteEncontrado, setClienteEncontrado] = useState<Paciente | null>(null);
  const [notas, setNotas] = useState("");

  // --- ESTADOS DE UI ---
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingClient, setIsSearchingClient] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  // Búsqueda de Paciente por DNI (ahora en la tabla 'pacientes')
  const buscarCliente = async () => {
    if (!dniCliente) return;
    setIsSearchingClient(true);
    setClienteEncontrado(null);
    setMensajeError("");

    const { data, error } = await supabase
      .from("pacientes")
      .select("*")
      .eq("dni", dniCliente)
      .single();

    setIsSearchingClient(false);

    if (error || !data) {
      setMensajeError("Paciente no encontrado. Regístralo en la sección de Pacientes.");
    } else {
      setClienteEncontrado(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeError("");
    setIsLoading(true);

    if (!date || !hora || !clienteEncontrado) {
      setMensajeError("Faltan datos obligatorios.");
      setIsLoading(false);
      return;
    }

    const fechaStr = format(date, "yyyy-MM-dd");

    // Inserción en tabla 'reservas' según esquema nuevo
    const { error } = await supabase.from("reservas").insert({
      paciente_id: clienteEncontrado.id,
      reserva_fecha: fechaStr,
      reserva_hora: hora,
      estado: "reservado",
      notas: notas || "Reserva manual"
    });

    if (error) {
      setMensajeError("Error al crear la reserva: " + error.message);
      setIsLoading(false);
      return;
    }

    await fetchEvents();
    if (date) goToDate(date);
    onOpenChange(false);
    setIsLoading(false);
  };

  return (
    <Modal isOpen={open} onOpenChange={onOpenChange} placement="center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Nueva Reserva</ModalHeader>
            <ModalBody>
              <form id="create-event-form" onSubmit={handleSubmit} className="grid gap-4">
                
                {/* 1. Buscador de Paciente */}
                <div className="space-y-2">
                  <div className="flex gap-2 items-end">
                    <Input
                      label="DNI del Paciente"
                      placeholder="Ingrese DNI"
                      value={dniCliente}
                      onValueChange={setDniCliente}
                      startContent={<User className="size-4 text-default-400" />}
                    />
                    <Button isIconOnly color="primary" variant="flat" onPress={buscarCliente} isLoading={isSearchingClient}>
                      <Search className="size-4" />
                    </Button>
                  </div>
                  {clienteEncontrado && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md border border-green-200">
                      <CheckCircle2 className="size-4" />
                      <span>{clienteEncontrado.nombre} {clienteEncontrado.apellido}</span>
                    </div>
                  )}
                </div>

                {/* 2. Fecha y Hora */}
                <div className="flex gap-4">
                  <DatePicker
                    label="Fecha"
                    className="flex-1"
                    minValue={today(getLocalTimeZone())}
                    value={date ? parseDate(format(date, "yyyy-MM-dd")) : undefined}
                    onChange={(val) => setDate(val?.toDate(getLocalTimeZone()))}
                  />
                  <Input
                    label="Hora"
                    type="time"
                    className="w-32"
                    value={hora}
                    onValueChange={setHora}
                    startContent={<Clock className="size-4 text-default-400" />}
                  />
                </div>

                <Input label="Notas" value={notas} onValueChange={setNotas} />

                {mensajeError && (
                  <div className="flex items-center gap-2 text-tiny text-danger bg-danger-50 p-2 rounded-md">
                    <AlertCircle className="size-4" />
                    {mensajeError}
                  </div>
                )}
              </form>
            </ModalBody>
            <ModalFooter>
              <Button variant="bordered" onPress={onClose}>Cancelar</Button>
              <Button color="primary" type="submit" form="create-event-form" isDisabled={!clienteEncontrado} isLoading={isLoading}>
                Agendar Cita
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}