"use client";

import { logout } from "@/app/auth-actions";
import TablaClientes from "@/components/clientes/tablaClientes";
import { Button } from "@heroui/button";
import { LogOut } from "lucide-react";

export default function PatientsPage() {
  
  // Función para cerrar sesión desde el cliente
  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Pacientes</h1>
        {/* Botón opcional si quieres tener logout dentro de la página además del navbar */}
        <Button 
          color="danger" 
          variant="flat" 
          startContent={<LogOut size={18} />}
          onPress={handleLogout}
        >
          Cerrar Sesión
        </Button>
      </div>

      {/* Renderizamos el componente de la tabla */}
      <TablaClientes />
    </div>
  );
}