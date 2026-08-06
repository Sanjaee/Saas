import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarView } from "@/components/dashboard/calendar/calendar-view";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Calendar" };

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <CalendarView />;
}
