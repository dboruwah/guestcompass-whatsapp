import { APP_NAME } from "@/lib/utils/constants"
import { ErrorBoundary } from "@/components/ErrorBoundary"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <div className="flex min-h-screen">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                <span className="text-lg font-bold text-accent-foreground">GC</span>
              </div>
              <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
            </div>
            {children}
          </div>
        </div>
        <div className="relative hidden flex-1 lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-secondary" />
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="max-w-md text-center">
              <h2 className="text-3xl font-semibold tracking-tight mb-4">
                Enterprise Hospitality Communication
              </h2>
              <p className="text-muted-foreground">
                Manage guest communications, WhatsApp campaigns, and CRM across your entire property portfolio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
