"use client";

import TablaClientes from "@/components/clientes/tablaClientes";

export default function PatientsPage() {
  return (
    <div className="flex flex-col gap-6">
      <TablaClientes />
    </div>
  );
}