// app/dashboard/layout.tsx
import { VisitsProvider } from '@/hooks/use-api'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <VisitsProvider>
      {children}
    </VisitsProvider>
  )
}