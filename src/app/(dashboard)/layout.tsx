import { DashboardShell } from "@/components/layout/DashboardShell"
import { AuthProvider } from "@/providers/AuthProvider"
import { ErrorBoundary } from "@/components/ErrorBoundary"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DashboardShell>{children}</DashboardShell>
      </AuthProvider>
    </ErrorBoundary>
  )
}
