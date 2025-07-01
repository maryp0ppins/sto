// components/modern-login.tsx - ПОЛНАЯ ВЕРСИЯ
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

const LoginBackground = () => (
  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950">
    <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
    <div className="absolute h-full w-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent blur-3xl" />
  </div>
)

export default function ModernLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('admin@admin.com')
  const [password, setPassword] = useState('admin')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        cache: 'no-store',
      })

      if (res.ok) {
        router.refresh()
        router.push('/dashboard')
      } else {
        setError('Неверный логин или пароль')
      }
    } catch (err) {
      setError('Ошибка сети. Попробуйте еще раз.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <LoginBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <Card className="w-full max-w-md border-0 shadow-2xl bg-background/80 backdrop-blur-xl">
          <CardHeader className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mb-4"
            >
              <Shield className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Добро пожаловать
            </CardTitle>
            <CardDescription>
              Войдите в систему управления СТО
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Пароль
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
                    <AlertDescription className="text-red-600 dark:text-red-400">
                      {error}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ 
                        duration: 1, 
                        repeat: Infinity, 
                        ease: "linear" 
                      }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Вход...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Войти в систему
                  </div>
                )}
              </Button>

              {/* Demo credentials hint */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground text-center">
                  Демо данные уже заполнены
                </p>
                <p className="text-xs text-center font-mono mt-1">
                  admin@admin.com / admin
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
