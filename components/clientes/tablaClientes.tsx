"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Trash2, Plus, Eye, Pencil, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useDisclosure } from "@heroui/modal";
import { Tooltip } from "@heroui/tooltip";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/table";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
import { User } from "@heroui/user";
import { Spinner } from "@heroui/spinner";

// Importación de los nuevos tipos
import { Paciente, PacienteInsert, PacienteUpdate } from "@/types/types";

const supabase = createClient();

export default function tablaClientes() {
  // UI States
  const [loading, setLoading] = useState(true);
  const [filterValue, setFilterValue] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Datos tipados
  const [pacientes, setPacientes] = useState<Paciente[]>([]); 
  const [nuevoPaciente, setNuevoPaciente] = useState<PacienteInsert>({
    dni: "",
    nombre: "",
    apellido: "",
    telefono: "",
  });
  const [editingPaciente, setEditingPaciente] = useState<PacienteUpdate | null>(null);

  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [modalNuevo, setModalNuevo] = useState(false);

  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [pacienteAEliminar, setPacienteAEliminar] = useState<Paciente | null>(null);

  const PHONE_REGEX = /^\+549\d{10}$/;

  const columns = [
    { name: "PACIENTE", uid: "paciente" },
    { name: "TELÉFONO", uid: "telefono" },
    { name: "ACCIONES", uid: "acciones" },
  ];

  const cargarPacientes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pacientes")
      .select("*")
      .order("apellido", { ascending: true });

    if (error) alert("Error cargando pacientes: " + error.message);
    else setPacientes(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    cargarPacientes();
  }, [cargarPacientes]);

  const agregarPaciente = async () => {
    if (!nuevoPaciente.dni || !nuevoPaciente.nombre || !nuevoPaciente.apellido || !nuevoPaciente.telefono) {
      alert("Todos los campos son obligatorios");
      return;
    }

    if (!PHONE_REGEX.test(nuevoPaciente.telefono)) {
      alert("El formato del teléfono es inválido. Debe ser +549 seguido de 10 dígitos.");
      return;
    }

    const { data, error } = await supabase
      .from("pacientes")
      .insert([nuevoPaciente])
      .select()
      .single();

    if (error) {
      alert("Error al agregar: " + error.message);
    } else {
      setPacientes([...pacientes, data]);
      setModalNuevo(false);
      setNuevoPaciente({ dni: "", nombre: "", apellido: "", telefono: "" });
    }
  };

  const eliminarPaciente = async () => {
    if (!pacienteAEliminar) return;

    const { error } = await supabase.from("pacientes").delete().eq("id", pacienteAEliminar.id);

    if (error) {
      alert("Error al eliminar: " + error.message);
    } else {
      setPacientes(pacientes.filter((p) => p.id !== pacienteAEliminar.id));
      onDeleteClose();
      setPacienteAEliminar(null);
    }
  };

  const guardarEdicion = async () => {
    if (!editingPaciente || !editingPaciente.id) return;
  
    if (!PHONE_REGEX.test(editingPaciente.telefono || "")) {
      alert("El formato del teléfono es inválido.");
      return;
    }

    const { error } = await supabase
      .from("pacientes")
      .update({
        nombre: editingPaciente.nombre,
        apellido: editingPaciente.apellido,
        dni: editingPaciente.dni,
        telefono: editingPaciente.telefono,
      })
      .eq("id", editingPaciente.id);

    if (error) {
      alert("Error al actualizar: " + error.message);
    } else {
      // Actualización local segura tipada
      setPacientes(pacientes.map((p) => (p.id === editingPaciente.id ? { ...p, ...editingPaciente } as Paciente : p)));
      onEditClose();
    }
  };

  const filteredItems = useMemo(() => {
    let filtered = [...pacientes];
    if (filterValue) {
      filtered = filtered.filter((p) =>
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(filterValue.toLowerCase()) ||
        p.dni.includes(filterValue)
      );
    }
    return filtered;
  }, [pacientes, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [page, filteredItems, rowsPerPage]);

  // Renderizado de celdas con tipo Paciente
  const renderCell = useCallback((paciente: Paciente, columnKey: React.Key) => {
    switch (columnKey) {
      case "paciente":
        return (
          <User
            avatarProps={{ showFallback: true, color: "primary" }}
            description={`DNI: ${paciente.dni}`}
            name={`${paciente.nombre} ${paciente.apellido}`}
          />
        );
      case "telefono":
        return <p className="text-sm">{paciente.telefono}</p>;
      case "acciones":
        return (
          <div className="flex items-center gap-2 justify-center">
            <Tooltip content="Editar">
              <Button isIconOnly variant="light" onPress={() => { setEditingPaciente({ ...paciente }); onEditOpen(); }}>
                <Pencil size={20} className="text-default-400" />
              </Button>
            </Tooltip>
            <Tooltip color="danger" content="Eliminar">
              <Button 
                isIconOnly
                variant="light"
                color="danger"
                onPress={() => {
                  setPacienteAEliminar(paciente); // Guardamos el paciente actual
                  onDeleteOpen(); // Abrimos el modal
                }}
              >
                <Trash2 size={20} />
              </Button>
            </Tooltip>
          </div>
        );
      default:
        return String(paciente[columnKey as keyof Paciente]);
    }
  }, []);

  const topContent = useMemo(() => (
    <div className="flex justify-between items-center gap-4">
      <Input
        isClearable
        className="w-full sm:max-w-[44%]"
        placeholder="Buscar por nombre o DNI..."
        startContent={<Search size={18} />}
        value={filterValue}
        onValueChange={(val) => { setFilterValue(val); setPage(1); }}
        onClear={() => setFilterValue("")}
      />
      <div className="flex gap-3 items-center">
        <Select
          className="w-24"
          labelPlacement="outside"
          selectedKeys={[String(rowsPerPage)]}
          onChange={(e) => setRowsPerPage(Number(e.target.value))}
          size="sm"
          aria-label="Filas por página"
        >
          <SelectItem key="5">5</SelectItem>
          <SelectItem key="10">10</SelectItem>
          <SelectItem key="15">15</SelectItem>
        </Select>
        <Button color="primary" startContent={<Plus size={18} />} onPress={() => setModalNuevo(true)}>
          Nuevo Paciente
        </Button>
      </div>
    </div>
  ), [filterValue, rowsPerPage]);

  const bottomContent = useMemo(() => (
    <div className="py-2 px-2 flex justify-center">
      <Pagination
        isCompact
        showControls
        color="primary"
        page={page}
        total={pages || 1}
        onChange={setPage}
      />
    </div>
  ), [page, pages]);

  return (
    <Card className="p-6">
      <Table
        aria-label="Tabla de gestión de pacientes"
        bottomContent={bottomContent}
        topContent={topContent}
        topContentPlacement="outside"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid} align={column.uid === "acciones" ? "center" : "start"}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody 
          emptyContent={loading ? <Spinner /> : "No se encontraron pacientes"} 
          items={items}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* MODALES CON ESTADOS TIPADOS */}
      <Modal isOpen={modalNuevo} onOpenChange={setModalNuevo}>
        <ModalContent>
          <ModalHeader>Registrar Nuevo Paciente</ModalHeader>
          <ModalBody className="gap-4">
            <div className="flex gap-4">
              <Input label="Nombre" value={nuevoPaciente.nombre} onChange={e => setNuevoPaciente({...nuevoPaciente, nombre: e.target.value})} />
              <Input label="Apellido" value={nuevoPaciente.apellido} onChange={e => setNuevoPaciente({...nuevoPaciente, apellido: e.target.value})} />
            </div>
            <Input label="DNI" value={nuevoPaciente.dni} onChange={e => setNuevoPaciente({...nuevoPaciente, dni: e.target.value})} />
            <Input 
              label="Teléfono" 
              placeholder="+5492991234567" 
              value={nuevoPaciente.telefono}
              description="Formato requerido: +549 seguido de 10 dígitos"
              isInvalid={nuevoPaciente.telefono !== "" && !PHONE_REGEX.test(nuevoPaciente.telefono)}
              errorMessage="El formato debe ser +549 seguido de 10 números (ej. +5492994562051)"
              onChange={e => setNuevoPaciente({...nuevoPaciente, telefono: e.target.value})} 
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setModalNuevo(false)}>Cancelar</Button>
            <Button color="primary" onPress={agregarPaciente}>Guardar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditOpen} onOpenChange={onEditClose}>
        <ModalContent>
          <ModalHeader>Editar Paciente</ModalHeader>
          <ModalBody className="gap-4">
            {editingPaciente && (
              <>
                <div className="flex gap-4">
                  <Input label="Nombre" value={editingPaciente.nombre || ""} onChange={e => setEditingPaciente({...editingPaciente, nombre: e.target.value})} />
                  <Input label="Apellido" value={editingPaciente.apellido || ""} onChange={e => setEditingPaciente({...editingPaciente, apellido: e.target.value})} />
                </div>
                <Input label="DNI" value={editingPaciente.dni || ""} onChange={e => setEditingPaciente({...editingPaciente, dni: e.target.value})} />
                <Input label="Teléfono" value={editingPaciente.telefono || ""} onChange={e => setEditingPaciente({...editingPaciente, telefono: e.target.value})} />
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onEditClose}>Cancelar</Button>
            <Button color="primary" onPress={guardarEdicion}>Actualizar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Confirmar eliminación</ModalHeader>
          <ModalBody>
            <p>
              ¿Estás seguro de que deseas eliminar al paciente{" "}
              <strong>{pacienteAEliminar?.nombre} {pacienteAEliminar?.apellido}</strong>?
            </p>
            <p className="text-danger text-sm">Esta acción es permanente y no se puede deshacer.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteClose}>
              Cancelar
            </Button>
            <Button color="danger" onPress={eliminarPaciente}>
              Eliminar Paciente
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
}