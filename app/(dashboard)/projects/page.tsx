import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProjectsGrid } from "@/components/dashboard/projects/projects-grid";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <ProjectsGrid />;
}
