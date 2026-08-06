import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HelpCenter } from "@/components/dashboard/help/help-center";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Help Center" };

export default async function HelpPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <HelpCenter />;
}
