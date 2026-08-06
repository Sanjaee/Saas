import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TeamPanel } from "@/components/dashboard/team/team-panel";
import { auth } from "@/lib/auth";
import { listTeamMembers } from "@/lib/data";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let members: Awaited<ReturnType<typeof listTeamMembers>> = [];
  try {
    members = await listTeamMembers();
  } catch {
    // offline
  }

  return <TeamPanel members={members as never} />;
}
