"use client";

import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { ShieldCheck, Database, Share2, Mail } from "lucide-react";

import { title, subtitle } from "@/components/primitives";

export default function PrivacyPolicy() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 max-w-4xl mx-auto px-6">
      <div className="inline-block text-center justify-center mb-8">
        <h1 className={title({ color: "blue" })}>Política de&nbsp;</h1>
        <h1 className={title()}>Privacidad</h1>
        <p className={subtitle({ fullWidth: true })}>
          Cómo protegemos y gestionamos la información en Recordatorios.
        </p>
      </div>

      <Card className="w-full shadow-lg border-none bg-content1">
        <CardBody className="p-8 gap-8">
          <section className="flex gap-4">
            <Database className="text-primary shrink-0" size={24} />
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold">1. Información que recopilamos</h2>
              <p className="text-default-600 text-sm">
                Recopilamos información necesaria para la gestión de turnos médicos:
              </p>
              <ul className="list-disc list-inside text-sm text-default-500 ml-2">
                <li>Datos del profesional: Email y rol para autenticación.</li>
                <li>Datos de pacientes: Nombre, apellido, DNI y teléfono para el agendamiento.</li>
                <li>Identificadores de Meta: ID de número de teléfono y WABA ID para la conexión oficial.</li>
              </ul>
            </div>
          </section>

          <Divider />

          <section className="flex gap-4">
            <ShieldCheck className="text-primary shrink-0" size={24} />
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold">2. Uso de los datos</h2>
              <p className="text-default-600 text-sm">
                Los datos se utilizan exclusivamente para:
              </p>
              <ul className="list-disc list-inside text-sm text-default-500 ml-2">
                <li>Gestionar la agenda de citas y disponibilidad.</li>
                <li>Enviar notificaciones automáticas vía WhatsApp Business API.</li>
                <li>Monitorear el estado de entrega de los recordatorios (enviado, leído, entregado).</li>
              </ul>
            </div>
          </section>

          <Divider />

          <section className="flex gap-4">
            <Share2 className="text-primary shrink-0" size={24} />
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold">3. Terceros y Transferencia</h2>
              <p className="text-default-600 text-sm italic">
                No vendemos ni alquilamos datos a terceros. 
              </p>
              <p className="text-sm text-default-500">
                La información de contacto de los pacientes se comparte únicamente con <strong>Meta Platforms, Inc.</strong> a través de su API oficial para el cumplimiento del servicio de mensajería solicitado por el profesional.
              </p>
            </div>
          </section>

          <Divider />

          <section className="flex gap-4">
            <Mail className="text-primary shrink-0" size={24} />
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold">4. Contacto</h2>
              <p className="text-sm text-default-500">
                Para consultas sobre privacidad o ejercicio de derechos ARCO, contáctenos en: 
                <span className="text-primary font-medium ml-1">info@odontologabetianamorante.com.ar</span>
              </p>
            </div>
          </section>
        </CardBody>
      </Card>
    </section>
  );
}