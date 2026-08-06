import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SettingsTabs } from "@/components/dashboard/settings/settings-tabs";
import { auth, requireUser } from "@/lib/auth";
import { get2FASecret } from "@/lib/data";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = await requireUser();
  if (!user) redirect("/login");

  let twoFactorEnabled = false;
  try {
    const twoFactor = await get2FASecret(user.id);
    twoFactorEnabled = !!twoFactor?.enabled;
  } catch {
    // offline
  }

  return (
    <SettingsTabs
      user={{
        name: user.name,
        email: user.email,
        company: user.company,
        phone: user.phone,
        image: user.image,
        language: user.language,
        timezone: user.timezone,
      }}
      twoFactorEnabled={twoFactorEnabled}
    />
  );
}
