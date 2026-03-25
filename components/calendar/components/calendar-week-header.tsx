"use client";

import { Button } from "@heroui/button";
import { format, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface CalendarWeekHeaderProps {
  weekDays: Date[];
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export function CalendarWeekHeader({
  weekDays,
  onPreviousWeek,
  onNextWeek,
}: CalendarWeekHeaderProps) {
  const today = new Date();

  return (
    <div className="flex border-b border-divider sticky top-0 z-40 bg-content1 w-max min-w-full">
      <div className="w-[80px] md:w-[104px] flex items-center gap-1 md:gap-2 p-1.5 md:p-2 border-r border-divider shrink-0 sticky left-0 z-50 bg-content1">
        <Button isIconOnly radius="full" size="sm" variant="light" onPress={onPreviousWeek}>
          <ChevronLeft className="size-4 md:size-5" />
        </Button>
        <Button isIconOnly radius="full" size="sm" variant="light" onPress={onNextWeek}>
          <ChevronRight className="size-4 md:size-5" />
        </Button>
      </div>
      {weekDays.map((day) => {
        const isToday = isSameDay(day, today);

        return (
          <div
            key={day.toISOString()}
            className="flex-1 border-r border-divider last:border-r-0 p-1.5 md:p-2 min-w-44 flex items-center"
          >
            <div
              className={clsx(
                "text-xs md:text-sm font-medium",
                isToday ? "text-blue-600 font-bold" : "text-foreground"
              )}
            >
              {format(day, "dd EEE").toUpperCase()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
