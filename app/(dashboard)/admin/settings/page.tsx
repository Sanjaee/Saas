import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { SystemSettingsForm, type SystemSettings } from "@/components/admin/system-settings-form";
import { auth, requireAdmin } from "@/lib/auth";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Admin · System Settings" };

export default async function AdminSettingsPage() {
  const session = await auth();
  const admin = await requireAdmin();
  if (!session?.user || !admin) redirect("/403");

  let settings: Record<string, string | null> = {};
  try {
    settings = await getSiteSettings();
  } catch {
    // offline
  }

  const parsed: SystemSettings = {
    app_name: settings.app_name ?? undefined,
    support_email: settings.support_email ?? undefined,
    maintenance_mode: settings.maintenance_mode === "true",
    allow_registration: settings.allow_registration !== "false",
    require_email_verification: settings.require_email_verification !== "false",
    default_currency: settings.default_currency ?? undefined,
    tax_rate: settings.tax_rate ?? undefined,
  };

  return (
    <div>
      <PageHeader title="System Settings" description="Global platform configuration." />
      <SystemSettingsForm settings={parsed} />
    </div>
  );
}
