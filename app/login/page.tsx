// src/app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

const handleLogin = async () => {
  console.log('Нажата кнопка входа')

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  })

  console.log('Ответ сервера:', res.status)

  if (res.ok) {
    console.log('Редирект на /dashboard')
    router.refresh()
    router.push('/dashboard')
  } else {
    setError('Неверный логин или пароль')
  }
}

  return (
    <Card className="max-w-sm mx-auto mt-20 p-6 space-y-4">
      <h2 className="text-xl font-bold">Вход</h2>
      <Input
        placeholder="Email"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
      />
      <Input
        placeholder="Пароль"
        type="password"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
      />
      {error && <div className="text-red-500">{error}</div>}
      <Button onClick={handleLogin}>Войти</Button>
    </Card>
  )
}
