import { AdminShell } from "@/components/admin/admin-shell";
import { SetupNotice } from "@/components/setup-notice";
import { requireAdmin } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/env";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const identity = await requireAdmin();

  return <AdminShell identity={identity}>{children}</AdminShell>;
}
