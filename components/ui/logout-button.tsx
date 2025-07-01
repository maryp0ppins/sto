// components/ui/logout-button.tsx - Исправленный компонент LogoutButton
'use client'

import { useRouter } from 'next/navigation'
import { Button } from './button'

interface LogoutButtonProps {
  icon?: React.ReactNode
  className?: string
}

export function LogoutButton({ icon, className }: LogoutButtonProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className={className}
    >
      {icon}
      Выход
    </Button>
  )
}
