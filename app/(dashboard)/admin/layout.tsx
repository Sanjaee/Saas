import { redirect } from "next/navigation";

import { auth, requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const admin = await requireAdmin();
  if (!session?.user || !admin) redirect("/403");
  return <>{children}</>;
}
