"use client"
import { useEffect, useState } from 'react'

export type UserInfo = { id: string; role: string } | null | undefined

export function useAuth() {
  const [user, setUser] = useState<UserInfo>(undefined) // undefined = loading

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' }) // обязательно!
      .then((r) => (r.ok ? r.json() : null))
      .then(setUser)
      .catch(() => setUser(null))
  }, [])

  return user
}
