"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";
import { 
  CalendarDays, 
  MessageCircle, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

export default function PresentationPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-6 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/10 to-transparent -z-10" />
        
        <Chip 
          variant="dot" 
          color="primary" 
          className="mb-6 border-none bg-primary/5 px-4"
        >
          SaaS de Gestión Médica
        </Chip>
        
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight max-w-3xl mb-6">
          Gestión de Citas con <span className="text-primary">Recordatorios Inteligentes</span>
        </h1>
        
        <p className="text-default-500 text-lg max-w-2xl mb-10">
          Optimiza la asistencia de tus pacientes con nuestra plataforma integrada de calendario 
          y automatización de mensajes vía WhatsApp Business.
        </p>

        <div className="flex gap-4">
          <Button as={Link} href="/login" color="primary" size="lg" radius="full" endContent={<ArrowRight size={18} />}>
            Comenzar ahora
          </Button>
          <Button variant="bordered" size="lg" radius="full">
            Ver Demo
          </Button>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Calendario */}
          <Card className="p-4 border-none bg-default-50/50 shadow-none hover:bg-default-100 transition-colors">
            <CardHeader className="flex gap-3">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                <CalendarDays size={28} />
              </div>
              <p className="text-xl font-bold">Calendario Dinámico</p>
            </CardHeader>
            <CardBody className="text-default-500">
              Visualiza y gestiona turnos en tiempo real con nuestra interfaz de arrastrar y soltar. 
              Organización semanal impecable para profesionales de la salud.
            </CardBody>
          </Card>

          {/* Card 2: WhatsApp */}
          <Card className="p-4 border-none bg-default-50/50 shadow-none hover:bg-default-100 transition-colors">
            <CardHeader className="flex gap-3">
              <div className="p-3 bg-green-500/10 rounded-2xl text-green-500">
                <MessageCircle size={28} />
              </div>
              <p className="text-xl font-bold">Recordatorios WhatsApp</p>
            </CardHeader>
            <CardBody className="text-default-500">
              Reducción del 40% en ausencias mediante notificaciones automáticas enviadas 24hs 
              antes de la cita directamente al celular del paciente.
            </CardBody>
          </Card>

          {/* Card 3: Pacientes */}
          <Card className="p-4 border-none bg-default-50/50 shadow-none hover:bg-default-100 transition-colors">
            <CardHeader className="flex gap-3">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                <Users size={28} />
              </div>
              <p className="text-xl font-bold">Gestión de Pacientes</p>
            </CardHeader>
            <CardBody className="text-default-500">
              Base de datos centralizada con historial de turnos, contactos y estados de asistencia 
              para un seguimiento personalizado.
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Meta/Compliance Section */}
      <section className="bg-default-50 py-16 px-6">
        <div className="max-w-4xl mx-auto border border-default-200 rounded-3xl p-8 bg-background shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <ShieldCheck size={20} />
            <span className="font-semibold uppercase tracking-wider text-xs">Cumplimiento y Seguridad</span>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-center md:text-left">
            Integración Oficial con WhatsApp Business API
          </h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <CheckCircle2 className="text-success mt-1" size={20} />
              <p className="text-default-600"><strong>Transparencia:</strong> Los pacientes reciben notificaciones solo sobre sus citas agendadas.</p>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="text-success mt-1" size={20} />
              <p className="text-default-600"><strong>Control del Usuario:</strong> Los profesionales vinculan su propio número oficial de empresa.</p>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="text-success mt-1" size={20} />
              <p className="text-default-600"><strong>Privacidad:</strong> Los datos se manejan bajo protocolos de cifrado de extremo a extremo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-default-400 text-sm">
        <p>© {new Date().getFullYear()} Recordatorios Kapso. Todos los derechos reservados.</p>
        <div className="flex justify-center gap-6 mt-4">
          <Link href="#">Privacidad</Link>
          <Link href="#">Términos</Link>
          <Link href="#">Contacto</Link>
        </div>
      </footer>
    </div>
  );
}