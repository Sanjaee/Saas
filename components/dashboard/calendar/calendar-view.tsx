"use client"

import * as React from "react"
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/dashboard/page-header"
import { cn } from "@/lib/utils"

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  color: string;
}

const EVENTS: Event[] = [
  { id: "1", title: "Growth review", date: addDays(new Date(), 1), time: "10:00", color: "bg-violet-500" },
  { id: "2", title: "Customer call — Acme", date: addDays(new Date(), 2), time: "14:30", color: "bg-emerald-500" },
  { id: "3", title: "Release v2.4", date: addDays(new Date(), 3), time: "09:00", color: "bg-indigo-500" },
  { id: "4", title: "Board sync", date: addDays(new Date(), 4), time: "16:00", color: "bg-amber-500" },
  { id: "5", title: "1:1 with Sarah", date: addDays(new Date(), -2), time: "11:00", color: "bg-rose-500" },
]

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const firstDayOfMonth = startOfMonth(currentMonth);
  const days = Array.from({ length: 42 }, (_, i) =>
    addDays(startOfWeek(firstDayOfMonth), i),
  );
  const selectedEvents = EVENTS;

  return (
    <div>
      <PageHeader title="Calendar" description="Plan your schedule and never miss a sync.">
        <Button className="gap-1.5"><Plus className="size-4" /> New event</Button>
      </PageHeader>

      <Card className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon-sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} aria-label="Previous month">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} aria-label="Next month">
              <ChevronRight className="size-4" />
            </Button>
            <h3 className="ml-2 text-lg font-bold">{format(currentMonth, "MMMM yyyy")}</h3>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="pb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {d}
            </div>
          ))}
          {days.map((day, i) => {
            const dayEvents = selectedEvents.filter((e) => isSameDay(e.date, day));
            const isCurrent = isSameDay(day, new Date());
            const inMonth = isSameMonth(day, currentMonth);
            return (
              <div
                key={i}
                className={cn(
                  "flex min-h-20 flex-col rounded-lg border p-1.5 sm:min-h-24 sm:p-2",
                  !inMonth && "bg-muted/30 opacity-50",
                  isCurrent && "border-violet-500 ring-1 ring-violet-500",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                    isCurrent ? "bg-violet-500 text-white" : "text-muted-foreground",
                  )}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "flex items-center gap-1 truncate rounded px-1.5 py-0.5 text-[10px] font-medium text-white",
                        event.color,
                      )}
                    >
                      <Clock className="size-2.5 shrink-0" />
                      <span className="truncate">{event.time} {event.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
