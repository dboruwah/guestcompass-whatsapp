import { DashboardShell } from "@/components/layout/DashboardShell"
import { AuthProvider } from "@/providers/AuthProvider"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  )
}
