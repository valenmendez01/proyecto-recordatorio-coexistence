// components/calendar/components/FacebookSDK.tsx
'use client';

import Script from 'next/script';
import { handleEmbeddedSignupEvent } from '@/app/meta-actions'; // Importamos la nueva acción

export default function FacebookSDK() {
  return (
    <>
      <div id="fb-root"></div>
      <Script
        id="facebook-jssdk-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.fbAsyncInit = function() {
              FB.init({
                appId            : '${process.env.NEXT_PUBLIC_META_APP_ID}',
                autoLogAppEvents : true,
                xfbml            : true,
                version          : '${process.env.WHATSAPP_API_VERSION}'
              });
            };

            window.addEventListener('message', async (event) => {
              if (!event.origin.endsWith('facebook.com')) return;
              try {
                const data = JSON.parse(event.data);
                if (data.type === 'WA_EMBEDDED_SIGNUP') {
                  console.log('message event: ', data); // Mantener para pruebas
                  
                  // Enviamos el objeto completo al servidor para su análisis
                  // Nota: Como este bloque se ejecuta en el navegador mediante string inyectado,
                  // usamos una referencia global o llamamos a la función importada si es posible.
                  // Para Next.js, lo más seguro es disparar un CustomEvent o llamar a una función 
                  // definida en el scope del componente.
                  window.dispatchEvent(new CustomEvent('wa_signup_event', { detail: data }));
                }
              } catch (e) {
                console.log('message event error: ', event.data);
              }
            });
          `,
        }}
      />
      <Script
        id="facebook-jssdk"
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Listener para capturar el evento disparado desde el script inyectado
          window.addEventListener('wa_signup_event', (e: any) => {
            handleEmbeddedSignupEvent(e.detail);
          });
        }}
      />
    </>
  );
}