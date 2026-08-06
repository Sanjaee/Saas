import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TasksBoard } from "@/components/dashboard/tasks/tasks-board";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Tasks" };

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <TasksBoard />;
}
