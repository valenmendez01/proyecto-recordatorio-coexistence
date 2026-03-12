"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  Settings2,
} from "lucide-react";
import { generateEmbeddedSignupUrl, sendTestMessage } from "@/app/meta-actions"; // ✅ nombre corregido
import { createClient } from "@/utils/supabase/client";
import { Input } from "@heroui/input";
import { Divider } from "@heroui/divider";

const supabase = createClient();

export default function ConfigPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [whatsappState, setWhatsappState] = useState<{
    status: "connected" | "disconnected";
    loading: boolean;
  }>({ status: "disconnected", loading: true });


  // ---------------------------------------------------------------------------
  // TEST META
  // ---------------------------------------------------------------------------
  const [testLoading, setTestLoading] = useState(false);
  const [testPhone, setTestPhone] = useState("");

  const handleSendTest = async () => {
    if (!testPhone) {
      setErrorMsg("Ingresa un número para la prueba.");
      return;
    }
    setErrorMsg("");
    setTestLoading(true);
    
    // Llamamos a la acción que usa las variables WHATSAPP_ACCESS_TOKEN y WHATSAPP_PHONE_NUMBER_ID
    const result = await sendTestMessage(testPhone);
    setTestLoading(false);

    if (result.error) {
      alert("Error: " + result.error);
    } else {
      alert("¡Mensaje de prueba enviado con éxito! Revisa tu WhatsApp.");
    }
  };

  // ---------------------------------------------------------------------------
  // Consulta el estado actual en la tabla `perfiles`
  // ---------------------------------------------------------------------------
  const checkStatus = async () => {
    setErrorMsg(null);
    setWhatsappState((prev) => ({ ...prev, loading: true }));

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setWhatsappState({ status: "disconnected", loading: false });
      return;
    }

    const { data, error } = await supabase
      .from("perfiles")
      .select("whatsapp_status")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[ConfigPage] Error consultando estado:", error);
      setWhatsappState((prev) => ({ ...prev, loading: false }));
      setErrorMsg("No se pudo verificar el estado de la conexión.");
      return;
    }

    setWhatsappState({
      status: data?.whatsapp_status === "connected" ? "connected" : "disconnected",
      loading: false,
    });
  };

  useEffect(() => {
    checkStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Inicia el flujo de Embedded Signup de Meta
  // ---------------------------------------------------------------------------
  const handleConnect = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const result = await generateEmbeddedSignupUrl();

      if ("error" in result) {
        // La Server Action devolvió un error tipado
        setErrorMsg(result.error);
        return;
      }

      // Redirigir al diálogo OAuth de Meta (abre en la misma pestaña)
      window.location.href = result.url;
    } catch (err) {
      console.error("[ConfigPage] Error inesperado al conectar:", err);
      setErrorMsg("Error inesperado al iniciar el registro con Meta.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Desconecta WhatsApp: limpia el estado en `perfiles`
  // ---------------------------------------------------------------------------
  const handleDisconnect = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMsg("No hay sesión activa.");
        return;
      }

      const { error } = await supabase
        .from("perfiles")
        .update({
          whatsapp_status: "disconnected",
          whatsapp_phone_number_id: null,
        })
        .eq("id", user.id);

      if (error) {
        console.error("[ConfigPage] Error al desconectar:", error);
        setErrorMsg("No se pudo desconectar. Intentá de nuevo.");
        return;
      }

      setWhatsappState({ status: "disconnected", loading: false });
    } catch (err) {
      console.error("[ConfigPage] Error inesperado al desconectar:", err);
      setErrorMsg("Error inesperado al desconectar WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto p-4 md:p-8">
      {/* CABECERA DE LA PÁGINA */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
        <p className="text-default-500">
          Gestiona la conexión con la API oficial de WhatsApp y la configuración de recordatorios.
        </p>
      </div>

      {/* SECCIÓN 1: VALIDACIÓN PARA REVISIÓN DE META (La más importante para tu video) */}
      <Card className="border-primary/40 border-2 shadow-lg bg-content1">
        <CardHeader className="flex gap-3 px-6 pt-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MessageSquare className="text-primary" size={24} />
          </div>
          <div className="flex flex-col">
            <p className="text-lg font-bold">Modo de Validación de API</p>
            <p className="text-small text-default-500">Demostración de envío de mensajes para revisión de App</p>
          </div>
        </CardHeader>
        
        <Divider />
        
        <CardBody className="px-6 py-8 flex flex-col gap-6">
          <div className="bg-default-100 p-4 rounded-xl border border-default-200">
            <p className="text-sm text-default-700 leading-relaxed">
              Esta herramienta permite enviar un mensaje de plantilla <strong>(hello_world)</strong> utilizando las credenciales configuradas en el servidor. 
              <br />
              <span className="text-tiny text-default-500 mt-2 block">
                * Nota para el revisor: El mensaje se envía a través de la infraestructura oficial de WhatsApp Business API.
              </span>
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <Input
              type="tel"
              label="Número de destino"
              labelPlacement="outside"
              placeholder="Ej: 542994562051"
              variant="bordered"
              className="max-w-xs"
              value={testPhone}
              onValueChange={setTestPhone}
              startContent={
                <span className="text-default-400 text-small">+</span>
              }
              description="Incluye código de país, área y número sin espacios."
            />
            
            <Button
              color="primary"
              size="lg"
              variant="shadow"
              isLoading={testLoading}
              onPress={handleSendTest}
              className="font-bold px-8"
              startContent={!testLoading && <RefreshCw size={20} />}
            >
              Enviar Mensaje de Prueba
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* SECCIÓN 2: ESTADO TÉCNICO DE LA CONEXIÓN */}
      <Card className="shadow-sm border-none bg-content1">
        <CardHeader className="px-6 pt-6">
          <h3 className="text-md font-bold flex items-center gap-2">
            <Settings2 size={18} />
            Identificadores de la Aplicación
          </h3>
        </CardHeader>
        <CardBody className="px-6 pb-6 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-default-50 rounded-lg border border-default-200">
              <p className="text-tiny uppercase font-bold text-default-400">Phone Number ID</p>
              <p className="font-mono text-small truncate">
                {process.env.WHATSAPP_PHONE_NUMBER_ID || "Configurado en el servidor"}
              </p>
            </div>
            <div className="p-3 bg-default-50 rounded-lg border border-default-200">
              <p className="text-tiny uppercase font-bold text-default-400">API Version</p>
              <p className="font-mono text-small">
                {process.env.WHATSAPP_API_VERSION || "v21.0"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <p className="text-tiny text-success-600 font-medium">Servicio de mensajería activo y listo para pruebas</p>
          </div>
        </CardBody>
      </Card>

      {/* SECCIÓN 3: GESTIÓN DE CUENTA (Opcional para el video) */}
      <div className="flex justify-end gap-3 mt-4">
        <Button variant="light" color="danger" startContent={<Trash2 size={18} />}>
          Desconectar Cuenta
        </Button>
      </div>
    </div>
  );
}