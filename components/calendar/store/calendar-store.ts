import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  startOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  format,
  endOfWeek,
} from "date-fns";

// Cambiado a cliente de navegador para evitar errores de Promise en Client Components
import { createClient } from "@/utils/supabase/client"; 
import { CalendarEvent } from "@/types/types";

// Inicializar cliente Supabase
const supabase = createClient();

export type CalendarStatusFilter =
  | "all"
  | "confirmado"
  | "reservado"
  | "cancelado";

interface CalendarState {
  currentWeekStart: Date;
  events: CalendarEvent[];
  isLoading: boolean;
  startHour: number;
  endHour: number;
  statusFilter: CalendarStatusFilter;
  goToNextWeek: () => void;
  goToPreviousWeek: () => void;
  goToToday: () => void;
  goToDate: (date: Date) => void;
  setStartHour: (hour: number) => void;
  setEndHour: (hour: number) => void;
  setStatusFilter: (filter: CalendarStatusFilter) => void;
  fetchEvents: () => Promise<void>;
  getCurrentWeekEvents: () => CalendarEvent[];
  getWeekDays: () => Date[];
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      currentWeekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),
      events: [],
      isLoading: false,
      startHour: 0,
      endHour: 23,
      statusFilter: "all",

      goToNextWeek: () => {
        set((state) => ({
          currentWeekStart: addWeeks(state.currentWeekStart, 1),
        }));
        get().fetchEvents();
      },

      goToPreviousWeek: () => {
        set((state) => ({
          currentWeekStart: subWeeks(state.currentWeekStart, 1),
        }));
        get().fetchEvents();
      },

      goToToday: () => {
        set({ currentWeekStart: startOfWeek(new Date(), { weekStartsOn: 1 }) });
        get().fetchEvents();
      },

      goToDate: (date: Date) => {
        set({ currentWeekStart: startOfWeek(date, { weekStartsOn: 1 }) });
        get().fetchEvents();
      },

      setStartHour: (hour) => set({ startHour: hour }),
      setEndHour: (hour) => set({ endHour: hour }),
      setStatusFilter: (filter) => set({ statusFilter: filter }),

      fetchEvents: async () => {
        set({ isLoading: true });
        const { currentWeekStart } = get();

        const startDate = format(currentWeekStart, "yyyy-MM-dd");
        const endDate = format(
          endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
          "yyyy-MM-dd",
        );

        try {
          const { data, error } = await supabase
            .from("reservas")
            .select(
              `
              id,
              reserva_fecha,
              hora_inicio, 
              hora_fin,
              estado,
              notas,
              paciente:pacientes(nombre, apellido)
            `,
            )
            .gte("reserva_fecha", startDate)
            .lte("reserva_fecha", endDate)
            .in("estado", ["reservado", "confirmado", "cancelado"]);

          if (error) throw error;

          const mappedEvents: CalendarEvent[] = (data || []).map((r: any) => {
            const nombreCompleto = r.paciente 
              ? `${r.paciente.nombre} ${r.paciente.apellido}` 
              : "Paciente Desconocido";

            return {
              id: r.id,
              title: nombreCompleto, // El título ahora es el nombre del paciente
              startTime: r.hora_inicio.slice(0, 5),
              endTime: r.hora_fin.slice(0, 5),
              date: r.reserva_fecha,
              participants: [nombreCompleto],
              status: r.estado as CalendarEvent["status"],
              description: r.notas,
            };
          });

          set({ events: mappedEvents, isLoading: false });
        } catch (error) {
          console.error("Error fetching events:", error);
          set({ isLoading: false });
        }
      },

      getCurrentWeekEvents: () => {
        const { events, statusFilter } = get();

        if (statusFilter === "all") {
          return events;
        }

        return events.filter((e) => e.status === statusFilter);
      },

      getWeekDays: () => {
        const { currentWeekStart } = get();
        const days: Date[] = [];

        for (let i = 0; i < 7; i++) {
          days.push(addDays(currentWeekStart, i));
        }

        return days;
      },
    }),
    {
      name: "calendar-storage",
      partialize: (state) => ({
        startHour: state.startHour,
        endHour: state.endHour,
        statusFilter: state.statusFilter,
      }),
    },
  ),
);