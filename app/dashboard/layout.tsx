// app/dashboard/layout.tsx
import { VisitsProvider } from '@/contexts/visits-context'

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