"use client"
import { useEffect, useState } from 'react'

export type UserInfo = { id: string; role: string } | null

export function useAuth() {
  const [user, setUser] = useState<UserInfo>(null)

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find((c) => c.startsWith('token='))
      ?.split('=')[1]
    if (!token) return
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as { id: string; role: string }
      setUser({ id: payload.id, role: payload.role })
    } catch (e) {
      console.error('Invalid token', e)
    }
  }, [])

  return user
}
