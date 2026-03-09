export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Portfolio",
  description: "Portfolio de mis inversiones",
  navItems: [
    {
      label: "Calendario",
      href: "/",
    },
    {
      label: "Pacientes",
      href: "/pacientes",
    },
    {
      label: "Configuración",
      href: "/configuracion",
    },
  ],
  navMenuItems: [
    {
      label: "Calendario",
      href: "/",
    },
    {
      label: "Pacientes",
      href: "/pacientes",
    },
    {
      label: "Configuración",
      href: "/configuracion",
    },
  ],
};
