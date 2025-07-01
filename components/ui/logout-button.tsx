'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
  className?: string
}

export function LogoutButton({ className }: LogoutButtonProps) {
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
    <div 
      onClick={handleLogout}
      className={`flex items-center gap-2 cursor-pointer ${className}`}
    >
      <LogOut className="size-4 shrink-0" />
      <span>Выход</span>
    </div>
  )
}