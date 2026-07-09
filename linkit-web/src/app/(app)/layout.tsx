import { requireActiveUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireActiveUser();

  return (
    <AppShell
      role={profile.role}
      userName={profile.name || profile.email || ""}
    >
      {children}
    </AppShell>
  );
}
