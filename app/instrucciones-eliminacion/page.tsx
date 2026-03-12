"use client";

import Link from "next/link";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Trash2, Smartphone, Globe, Mail, LogOut } from "lucide-react";

import { title, subtitle } from "@/components/primitives";

export default function DataDeletion() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 max-w-4xl mx-auto px-6">
      <div className="inline-block text-center justify-center mb-8">
        <h1 className={title({ color: "blue" })}>Eliminación de&nbsp;</h1>
        <h1 className={title()}>Datos</h1>
        <p className={subtitle({ fullWidth: true })}>
          Instrucciones claras para gestionar o eliminar su información.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Opción 1: Desvincular WhatsApp */}
        <Card className="p-4 shadow-md">
          <CardHeader className="flex gap-3">
            <Smartphone className="text-success" />
            <h2 className="font-bold">Desde WhatsApp</h2>
          </CardHeader>
          <CardBody className="text-sm text-default-500 gap-2">
            <p>Para revocar el acceso desde su dispositivo móvil:</p>
            <ol className="list-decimal list-inside gap-1">
              <li>Abra WhatsApp Business.</li>
              <li>Ajustes &gt; Cuenta.</li>
              <li>Plataforma para empresas.</li>
              <li>Seleccione <strong>Recordatorios</strong> y presione Desconectar.</li>
            </ol>
          </CardBody>
        </Card>

        {/* Opción 2: Facebook Business */}
        <Card className="p-4 shadow-md">
          <CardHeader className="flex gap-3">
            <Globe className="text-primary" />
            <h2 className="font-bold">Desde Meta Business</h2>
          </CardHeader>
          <CardBody className="text-sm text-default-500 gap-2">
            <p>Para desvincular la aplicación web:</p>
            <ul className="list-disc list-inside">
              <li>Vaya a business.facebook.com.</li>
              <li>Integraciones &gt; Aplicaciones conectadas.</li>
              <li>Busque <strong>Recordatorios</strong> y elimine los permisos.</li>
            </ul>
          </CardBody>
        </Card>

        {/* Opción 3: En la App */}
        <Card className="p-4 shadow-md">
          <CardHeader className="flex gap-3">
            <LogOut className="text-warning" />
            <h2 className="font-bold">Dentro de Kapso</h2>
          </CardHeader>
          <CardBody className="text-sm text-default-500 gap-2">
            <p>Puede limpiar sus credenciales de Meta en el sistema:</p>
            <p>Vaya a <strong>Configuración</strong> y presione el botón de Desconectar. Esto eliminará su Phone ID de nuestra base de datos.</p>
            <Button as={Link} className="mt-2" color="warning" href="/configuracion" size="sm" variant="flat">
              Ir a Configuración
            </Button>
          </CardBody>
        </Card>

        {/* Opción 4: Eliminación Total */}
        <Card className="p-4 shadow-md border-danger-100 border-2">
          <CardHeader className="flex gap-3">
            <Trash2 className="text-danger" />
            <h2 className="font-bold text-danger">Eliminación Completa</h2>
          </CardHeader>
          <CardBody className="text-sm text-default-500 gap-2">
            <p>Si desea borrar permanentemente su cuenta, pacientes y todo el historial de turnos:</p>
            <div className="flex items-center gap-2 bg-default-100 p-2 rounded-lg mt-2">
              <Mail size={16} />
              <span className="font-mono">soporte@tudominio.com</span>
            </div>
            <p className="text-tiny mt-2 italic">Procesaremos su solicitud en un plazo de 48hs hábiles.</p>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}