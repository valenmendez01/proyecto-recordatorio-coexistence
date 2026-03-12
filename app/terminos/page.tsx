"use client";

import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { FileText, UserCheck, AlertTriangle, MessageCircle } from "lucide-react";

import { title, subtitle } from "@/components/primitives";

export default function TermsOfService() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 max-w-4xl mx-auto px-6">
      <div className="inline-block text-center justify-center mb-8">
        <h1 className={title({ color: "blue" })}>Condiciones del&nbsp;</h1>
        <h1 className={title()}>Servicio</h1>
        <p className={subtitle({ fullWidth: true })}>
          Reglas de uso de la plataforma Recordatorios.
        </p>
      </div>

      <Card className="w-full shadow-lg border-none bg-content1">
        <CardBody className="p-8 gap-8">
          <section className="flex gap-4">
            <FileText className="text-primary shrink-0" size={24} />
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold">1. Aceptación de los términos</h2>
              <p className="text-sm text-default-500">
                Al registrarse y utilizar nuestra plataforma, el usuario (profesional de la salud) acepta estas condiciones y garantiza que tiene el derecho legal de gestionar la información de sus pacientes.
              </p>
            </div>
          </section>

          <Divider />

          <section className="flex gap-4">
            <UserCheck className="text-primary shrink-0" size={24} />
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold">2. Responsabilidad de Consentimiento</h2>
              <p className="text-sm text-default-500">
                Es responsabilidad exclusiva del usuario obtener el consentimiento previo y explícito de los pacientes para el envío de mensajes de WhatsApp. Kapso actúa solo como un intermediario técnico.
              </p>
            </div>
          </section>

          <Divider />

          <section className="flex gap-4">
            <MessageCircle className="text-primary shrink-0" size={24} />
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold">3. Uso de la API de Meta</h2>
              <p className="text-sm text-default-500">
                La integración está sujeta a las políticas comerciales de Meta. El mal uso de las plantillas de mensajes o el envío de spam puede resultar en la suspensión del número por parte de Meta, de lo cual Recordatorios no es responsable.
              </p>
            </div>
          </section>

          <Divider />

          <section className="flex gap-4">
            <AlertTriangle className="text-primary shrink-0" size={24} />
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold">4. Limitación de Responsabilidad</h2>
              <p className="text-sm text-default-500">
                Recordatorios no garantiza la entrega del 100% de los mensajes, ya que esta depende de la disponibilidad de los servicios de Meta y de la conectividad del dispositivo del paciente.
              </p>
            </div>
          </section>
        </CardBody>
      </Card>
    </section>
  );
}