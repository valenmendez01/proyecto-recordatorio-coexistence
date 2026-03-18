'use client';

import Script from 'next/script';

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
          `,
        }}
      />
      <Script
        id="facebook-jssdk"
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('[Facebook SDK] Cargado correctamente');
        }}
      />
    </>
  );
}