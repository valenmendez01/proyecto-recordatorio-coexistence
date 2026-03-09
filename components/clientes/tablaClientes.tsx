"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Trash2, Plus, Save, Eye, Pencil, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
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

// Inicializar cliente de navegador
const supabase = createClient();

export default function TablaClientes() {
  // UI States
  const [loading, setLoading] = useState(true);
  const [filterValue, setFilterValue] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Datos
  const [pacientes, setPacientes] = useState<[]>([]); // Aquí puedes usar tu tipo Paciente
  const [nuevoPaciente, setNuevoPaciente] = useState({
    dni: "",
    nombre: "",
    apellido: "",
    telefono: "",
  });
  const [selectedPaciente, setSelectedPaciente] = useState<any | null>(null);
  const [editingPaciente, setEditingPaciente] = useState<any | null>(null);

  // Modales
  const [modalNuevo, setModalNuevo] = useState(false);
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  // Configuración de columnas
  const columns = [
    { name: "PACIENTE", uid: "paciente" },
    { name: "TELÉFONO", uid: "telefono" },
    { name: "ACCIONES", uid: "acciones" },
  ];

  // ==================== CARGA DE DATOS ====================
  const cargarPacientes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pacientes") // Tabla definida en tu SQL
      .select("*")
      .order("apellido", { ascending: true });

    if (error) alert("Error cargando pacientes: " + error.message);
    else setPacientes(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    cargarPacientes();
  }, [cargarPacientes]);

  // ==================== OPERACIONES CRUD ====================
  const agregarPaciente = async () => {
    if (!nuevoPaciente.dni || !nuevoPaciente.nombre || !nuevoPaciente.apellido || !nuevoPaciente.telefono) {
      alert("Todos los campos son obligatorios");
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

  const eliminarPaciente = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este paciente?")) return;

    const { error } = await supabase.from("pacientes").delete().eq("id", id);

    if (error) alert("Error al eliminar: " + error.message);
    else setPacientes(pacientes.filter((p) => p.id !== id));
  };

  const guardarEdicion = async () => {
    if (!editingPaciente) return;

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
      setPacientes(pacientes.map((p) => (p.id === editingPaciente.id ? editingPaciente : p)));
      onEditClose();
    }
  };

  // ==================== LÓGICA DE FILTRADO Y PAGINACIÓN ====================
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

  // ==================== RENDERIZADO DE CELDAS ====================
  const renderCell = useCallback((paciente: any, columnKey: React.Key) => {
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
          <div className="flex items-center gap-2">
            <Tooltip content="Ver detalles">
              <Button isIconOnly variant="light" onPress={() => { setSelectedPaciente(paciente); onDetailsOpen(); }}>
                <Eye size={20} className="text-default-400" />
              </Button>
            </Tooltip>
            <Tooltip content="Editar">
              <Button isIconOnly variant="light" onPress={() => { setEditingPaciente({ ...paciente }); onEditOpen(); }}>
                <Pencil size={20} className="text-default-400" />
              </Button>
            </Tooltip>
            <Tooltip color="danger" content="Eliminar">
              <Button isIconOnly variant="light" color="danger" onPress={() => eliminarPaciente(paciente.id)}>
                <Trash2 size={20} />
              </Button>
            </Tooltip>
          </div>
        );
      default:
        return paciente[columnKey];
    }
  }, [pacientes]);

  // ==================== CONTENIDOS DE LA TABLA = ====================
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

      {/* MODAL NUEVO PACIENTE */}
      <Modal isOpen={modalNuevo} onOpenChange={setModalNuevo}>
        <ModalContent>
          <ModalHeader>Registrar Nuevo Paciente</ModalHeader>
          <ModalBody className="gap-4">
            <div className="flex gap-4">
              <Input label="Nombre" value={nuevoPaciente.nombre} onChange={e => setNuevoPaciente({...nuevoPaciente, nombre: e.target.value})} />
              <Input label="Apellido" value={nuevoPaciente.apellido} onChange={e => setNuevoPaciente({...nuevoPaciente, apellido: e.target.value})} />
            </div>
            <Input label="DNI" value={nuevoPaciente.dni} onChange={e => setNuevoPaciente({...nuevoPaciente, dni: e.target.value})} />
            <Input label="Teléfono" placeholder="+549..." value={nuevoPaciente.telefono} onChange={e => setNuevoPaciente({...nuevoPaciente, telefono: e.target.value})} />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setModalNuevo(false)}>Cancelar</Button>
            <Button color="primary" onPress={agregarPaciente}>Guardar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* MODAL EDICIÓN */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditClose}>
        <ModalContent>
          <ModalHeader>Editar Paciente</ModalHeader>
          <ModalBody className="gap-4">
            {editingPaciente && (
              <>
                <div className="flex gap-4">
                  <Input label="Nombre" value={editingPaciente.nombre} onChange={e => setEditingPaciente({...editingPaciente, nombre: e.target.value})} />
                  <Input label="Apellido" value={editingPaciente.apellido} onChange={e => setEditingPaciente({...editingPaciente, apellido: e.target.value})} />
                </div>
                <Input label="DNI" value={editingPaciente.dni} onChange={e => setEditingPaciente({...editingPaciente, dni: e.target.value})} />
                <Input label="Teléfono" value={editingPaciente.telefono} onChange={e => setEditingPaciente({...editingPaciente, telefono: e.target.value})} />
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onEditClose}>Cancelar</Button>
            <Button color="primary" onPress={guardarEdicion}>Actualizar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
}