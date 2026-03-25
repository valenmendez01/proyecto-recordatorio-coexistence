"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SWRConfig } from 'swr';
import { useTheme } from "next-themes"; // Importar esto
import { useEffect } from "react";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  const ThemeSync = () => {
    const { resolvedTheme } = useTheme();

    useEffect(() => {
      // Definimos el color según el tema
      const color = resolvedTheme === "dark" ? "#000000" : "#ffffff";
      
      // Buscamos o creamos el meta tag 'theme-color'
      let meta = document.querySelector('meta[name="theme-color"]');
      
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "theme-color");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", color);
    }, [resolvedTheme]);

    return null;
  };

  return (
    <SWRConfig value={{
      revalidateOnFocus: false,
      dedupingInterval: 5000
    }}>
      <HeroUIProvider navigate={router.push}>
        <NextThemesProvider {...themeProps}>
          <ThemeSync />
          {children}
        </NextThemesProvider>
      </HeroUIProvider>
    </SWRConfig>
  );
}
