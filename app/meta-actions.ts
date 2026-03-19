"use server";

import { createClient } from "@/utils/supabase/server";

const API_VERSION = process.env.WHATSAPP_API_VERSION;
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

// Acción de Servidor para Procesar el Objeto
// Para extraer los identificadores (phone_number_id, waba_id) o el paso de abandono (current_step).
export async function handleEmbeddedSignupEvent(payload: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const { data, event, type } = payload;

  if (type !== 'WA_EMBEDDED_SIGNUP') return;

  // CASO 1: ÉXITO (Captura de identificadores)
  if (data.phone_number_id && data.waba_id) {
    console.log(`[Server] Registro exitoso. PhoneID: ${data.phone_number_id}, WABA: ${data.waba_id}`);
    
    // Actualizamos el perfil con los nuevos IDs
    await supabase
      .from("perfiles")
      .update({
        whatsapp_phone_number_id: data.phone_number_id,
        whatsapp_customer_id: data.waba_id, // Usamos waba_id como identificador de cliente
        whatsapp_status: 'connected'
      })
      .eq("id", user.id);
      
    return { success: true };
  }

  // CASO 2: ABANDONO (Determinación de pantalla)
  if (event === 'CANCEL' && data.current_step) {
    console.warn(`[Server] El usuario abandonó en la pantalla: ${data.current_step}`);
    
    // Aquí podrías registrar el abandono en una tabla de auditoría si fuera necesario
    return { abandoned: true, step: data.current_step };
  }

  // CASO 3: ERROR
  if (event === 'CANCEL' && data.error_message) {
    console.error(`[Server] Error reportado por Meta: ${data.error_message} (ID: ${data.error_id})`);
    return { error: data.error_message };
  }
}

/**
 * PASO 1: Intercambiar el código por un Token Empresarial (Business Token)
 *
 */
export async function exchangeCodeForBusinessToken(code: string) {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  const url = `${BASE_URL}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) throw new Error(data.error?.message || "Error al obtener el token empresarial");

  // Este es el <BUSINESS_TOKEN> solicitado en la documentación
  return data.access_token as string;
}

/**
 * PASO 2: Suscribirse a los webhooks en la WABA del cliente
 *
 */
export async function subscribeAppToWaba(wabaId: string, businessToken: string) {
  const url = `${BASE_URL}/${wabaId}/subscribed_apps`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${businessToken}`
    }
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Error suscribiendo la app a la WABA:", data);
    throw new Error(data.error?.message || "Fallo en la suscripción de webhooks");
  }

  return data.success; // Retorna true si es correcto
}

/**
 * PASO 3: Registrar el número de teléfono con un PIN
 *
 */
export async function registerPhoneNumber(phoneNumberId: string, businessToken: string) {
  const url = `${BASE_URL}/${phoneNumberId}/register`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${businessToken}`
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      pin: "123456" // <DESIRED_PIN>: Debe ser de 6 dígitos
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Error al registrar el número");

  return data.success; // Retorna true si es correcto
}

// Función integradora
export async function completeOnboarding(code: string, wabaId: string, phoneNumberId: string) {
  try {
    // 1. Intercambio de código por Token
    const businessToken = await exchangeCodeForBusinessToken(code);

    // 2. Suscribir App a la WABA
    await subscribeAppToWaba(wabaId, businessToken);

    // 3. Registrar el número de teléfono
    await registerPhoneNumber(phoneNumberId, businessToken);

    // 4. Guardar todo en Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("perfiles").update({
        whatsapp_phone_number_id: phoneNumberId,
        whatsapp_customer_id: wabaId,
        whatsapp_status: 'connected'
        // Es recomendable guardar también el businessToken si necesitas 
        // realizar acciones administrativas futuras en nombre del cliente.
      }).eq("id", user.id);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Fallo en el Onboarding:", error.message);
    return { error: error.message };
  }
}

// ---------------------------------------------------------------------------
// VER QUE HACER CON ESTO
// ---------------------------------------------------------------------------
/**
 * meta-actions.ts
 *
 * Server Actions para la integración con Meta WhatsApp Cloud API.
 * Reemplaza la lógica de kapso-actions.ts con conexión directa a Meta.
 *
 * Variables de entorno requeridas:
 *   NEXT_PUBLIC_META_APP_ID  — ID público de tu App de Meta
 *   META_CONFIG_ID           — ID de configuración del Embedded Signup (WhatsApp Business)
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface EmbeddedSignupUrlResult {
  url: string;
}

export interface EmbeddedSignupUrlError {
  error: string;
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Versión de la Graph API de Meta a usar */
const META_API_VERSION = "v21.0";

/** URL base del diálogo de OAuth de Meta */
const META_OAUTH_BASE_URL = "https://www.facebook.com/dialog/oauth";

/**
 * Scopes requeridos para la integración con WhatsApp Business Cloud API:
 * - whatsapp_business_management : gestionar cuentas y números de teléfono
 * - whatsapp_business_messaging  : enviar mensajes a través de la API
 */
const REQUIRED_SCOPES = [
  "whatsapp_business_management",
  "whatsapp_business_messaging",
].join(",");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Devuelve la URL base absoluta del sitio.
 * En producción usa NEXT_PUBLIC_SITE_URL; en desarrollo usa localhost.
 */
function getSiteBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  const port = process.env.PORT ?? "3000";
  return `http://localhost:${port}`;
}

// ---------------------------------------------------------------------------
// Server Action principal
// ---------------------------------------------------------------------------

/**
 * generateEmbeddedSignupUrl
 *
 * Construye la URL de Embedded Signup de Meta para que el usuario pueda
 * vincular su número de WhatsApp Business directamente (sin intermediarios).
 *
 * @returns La URL lista para redirigir al usuario, o un objeto de error.
 */
export async function generateEmbeddedSignupUrl(): Promise<
  EmbeddedSignupUrlResult | EmbeddedSignupUrlError
> {
  // 1. Validar variables de entorno obligatorias
  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const configId = process.env.META_CONFIG_ID;

  if (!appId) {
    console.error("[meta-actions] Falta la variable NEXT_PUBLIC_META_APP_ID");
    return { error: "Configuración incompleta: META_APP_ID no definido." };
  }

  if (!configId) {
    console.error("[meta-actions] Falta la variable META_CONFIG_ID");
    return { error: "Configuración incompleta: META_CONFIG_ID no definido." };
  }

  // 2. Construir la URL de redirección tras el signup exitoso
  const redirectUri = `${getSiteBaseUrl()}/whatsapp/success`;

  // 3. Generar un estado aleatorio para protección CSRF
  //    (en producción, persiste este valor en sesión/cookie para validarlo al retornar)
  const state = crypto.randomUUID();

  // 4. Construir los parámetros del diálogo de OAuth
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: REQUIRED_SCOPES,
    response_type: "code",
    config_id: configId,
    override_default_response_type: "true",
    state,
    // Extras recomendados por Meta para Embedded Signup
    extras: JSON.stringify({
      version: META_API_VERSION,
      sessionInfoVersion: "3",
    }),
  });

  // 5. Armar la URL final
  const url = `${META_OAUTH_BASE_URL}?${params.toString()}`;

  console.info("[meta-actions] URL de Embedded Signup generada correctamente.");

  return { url };
}

// ---------------------------------------------------------------------------
// Server Action de intercambio de código por token
// ---------------------------------------------------------------------------

/**
 * exchangeCodeForToken
 *
 * Intercambia el `code` devuelto por Meta tras el Embedded Signup
 * por un token de acceso de larga duración.
 *
 * Llama a esta función desde el Route Handler de /whatsapp/success.
 *
 * @param code - Código de autorización recibido en el query string de la redirección.
 * @returns El token de acceso y el WABA ID, o un error.
 */
export async function exchangeCodeForToken(code: string): Promise<
  | {
      accessToken: string;
      wabaId: string;
      phoneNumberId: string;
    }
  | EmbeddedSignupUrlError
> {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) {
    return {
      error:
        "Configuración incompleta: META_APP_ID o META_APP_SECRET no definidos.",
    };
  }

  const redirectUri = `${getSiteBaseUrl()}/whatsapp/success`;

  // Intercambiar código por token
  const tokenUrl = new URL(
    `https://graph.facebook.com/${META_API_VERSION}/oauth/access_token`
  );
  tokenUrl.searchParams.set("client_id", appId);
  tokenUrl.searchParams.set("client_secret", appSecret);
  tokenUrl.searchParams.set("redirect_uri", redirectUri);
  tokenUrl.searchParams.set("code", code);

  const tokenRes = await fetch(tokenUrl.toString());
  const tokenData = await tokenRes.json();

  if (!tokenRes.ok || tokenData.error) {
    console.error("[meta-actions] Error al intercambiar código:", tokenData);
    return {
      error: tokenData?.error?.message ?? "Error al obtener el token de Meta.",
    };
  }

  const accessToken: string = tokenData.access_token;

  // Obtener el WABA y el Phone Number ID asociados al token
  const debugUrl = new URL(
    `https://graph.facebook.com/${META_API_VERSION}/debug_token`
  );
  debugUrl.searchParams.set("input_token", accessToken);
  debugUrl.searchParams.set(
    "access_token",
    `${appId}|${appSecret}` // App token
  );

  const debugRes = await fetch(debugUrl.toString());
  const debugData = await debugRes.json();

  if (!debugRes.ok || debugData.error) {
    console.error("[meta-actions] Error al depurar token:", debugData);
    return {
      error:
        debugData?.error?.message ??
        "No se pudo verificar el token de acceso.",
    };
  }

  // Los granular_scopes de WhatsApp incluyen el WABA ID
  const wabaScope = debugData.data?.granular_scopes?.find(
    (s: { scope: string; target_ids?: string[] }) =>
      s.scope === "whatsapp_business_management"
  );

  const wabaId: string = wabaScope?.target_ids?.[0] ?? "";

  // Obtener el Phone Number ID del WABA
  let phoneNumberId = "";
  if (wabaId) {
    const phoneRes = await fetch(
      `https://graph.facebook.com/${META_API_VERSION}/${wabaId}/phone_numbers?access_token=${accessToken}`
    );
    const phoneData = await phoneRes.json();
    phoneNumberId = phoneData?.data?.[0]?.id ?? "";
  }

  console.info(
    "[meta-actions] Token obtenido. WABA ID:",
    wabaId,
    "| Phone Number ID:",
    phoneNumberId
  );

  return { accessToken, wabaId, phoneNumberId };
}

// app/meta-actions.ts

/**
 * Envía un mensaje de prueba utilizando la plantilla 'hello_world'
 * para la validación de Meta.
 */
export async function sendTestMessage(recipientPhone: string) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.WHATSAPP_API_VERSION || "v21.0";

  if (!accessToken || !phoneNumberId) {
    return { error: "Configuración de WhatsApp incompleta en el servidor." };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: recipientPhone,
          type: "template",
          template: {
            name: "hello_world",
            language: { code: "en_US" },
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Error al enviar el mensaje");
    }

    return { success: true, messageId: data.messages[0].id };
  } catch (error: any) {
    console.error("[sendTestMessage] Error:", error);
    return { error: error.message };
  }
}

/**
 * Registra el número como pre-verificado en la WABA de Meta.
 * Esto se hace una sola vez para preparar el Embedded Signup.
 */
export async function preVerifyPhoneNumber(phoneNumber: string) {
  const wabaId = "2292137800994631"; // 👈 El ID que aparece en tu snippet
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!accessToken) {
    return { error: "WHATSAPP_ACCESS_TOKEN no configurado" };
  }

  try {
    const url = `https://graph.facebook.com/${META_API_VERSION}/${wabaId}/add_phone_numbers`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone_number: phoneNumber,
        access_token: accessToken,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("[meta-actions] Error en pre-verificación:", data.error);
      return { error: data.error.message };
    }

    console.log("[meta-actions] ✅ Número pre-verificado con éxito:", data);
    return { success: true, data };
  } catch (error) {
    console.error("[meta-actions] Error de red:", error);
    return { error: "Error de conexión con Meta" };
  }
}