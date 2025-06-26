'use client'

import { useRouter } from 'next/navigation'
import React from 'react'
import { SidebarMenuButton } from '@/components/ui/sidebar'

export function LogoutButton({
  icon,
}: {
  icon: React.ReactNode
}) {
  const router = useRouter()

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <SidebarMenuButton asChild tooltip="Выход">
      {/* Используем <a>, чтобы сохранить нужные стили, но перехватываем клик */}
      <a href="/logout" onClick={handleLogout} className="flex items-center gap-2">
        {icon}
        <span>Выход</span>
      </a>
    </SidebarMenuButton>
  )
}
