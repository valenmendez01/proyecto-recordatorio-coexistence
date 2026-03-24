import { create } from "zustand";

interface PacientesUIStore {
  filterValue: string;
  page: number;
  rowsPerPage: number;
  setFilterValue: (val: string) => void;
  setPage: (page: number) => void;
  setRowsPerPage: (n: number) => void;
}

export const usePacientesStore = create<PacientesUIStore>((set) => ({
  filterValue: "",
  page: 1,
  rowsPerPage: 10,
  setFilterValue: (val) => set({ filterValue: val, page: 1 }),
  setPage: (page) => set({ page }),
  setRowsPerPage: (rowsPerPage) => set({ rowsPerPage, page: 1 }),
}));