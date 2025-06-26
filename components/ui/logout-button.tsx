'use client'

import { useRouter } from 'next/navigation'
import React from 'react'
import { SidebarMenuButton } from '@/components/ui/sidebar'

export function LogoutButton({ icon }: { icon: React.ReactNode }) {
  const router = useRouter()

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        router.push('/login')
      } else {
        console.error('Logout failed')
      }
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <SidebarMenuButton asChild tooltip="Выход">
      <button onClick={handleLogout} className="flex items-center gap-2">
        {icon}
        <span>Выход</span>
      </button>
    </SidebarMenuButton>
  )
}
