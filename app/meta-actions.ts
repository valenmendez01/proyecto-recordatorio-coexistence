"use server";

export async function getMetaSignupUrl() {
  const APP_ID = process.env.NEXT_PUBLIC_META_APP_ID;
  const CONFIG_ID = process.env.META_CONFIG_ID; // Se obtiene en el App Dashboard de Meta
  const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/whatsapp/success`;

  // Esta URL abre el flujo de registro de Meta
  const url = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${APP_ID}&display=page&extras={"setup":{"configurations":{"whatsapp_business_account":{"id":"${CONFIG_ID}"}}}}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=whatsapp_business_management,whatsapp_business_messaging`;
  
  return { url };
}