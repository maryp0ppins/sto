// app/dashboard/record/new/steps/StepClient.tsx
'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Phone, Search, Loader2, Plus, X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useClientSearch } from '@/hooks/use-api'
import type { StepProps } from '../StepProps'
import type { Client as ApiClient } from '@/lib/api'

// Анимации
const stepVariants = {
  hidden: { opacity: 0, x: 100, scale: 0.95 },
  visible: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -100, scale: 0.95 }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function StepClient({ onNextAction }: StepProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '' })
  
  const { searchResults, loading, searchClients } = useClientSearch()

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (query.length >= 3) {
      searchClients(query)
    }
  }, [searchClients])

  const handleSelectClient = (client: ApiClient) => {
    // Конвертируем типы API в типы wizard
    const convertedClient = {
      _id: client._id,
      name: client.name,
      phone: client.phone,
      email: client.email,
      vehicles: client.vehicles?.map(v => ({
        _id: v._id,
        make: v.make,
        model: v.model,
        year: v.year,
        licensePlate: v.licensePlate || '',
        vin: v.vin
      }))
    }
    onNextAction({ client: convertedClient })
  }

  const handleCreateClient = async () => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      })
      
      if (response.ok) {
        const client = await response.json()
        const convertedClient = {
          _id: client._id,
          name: client.name,
          phone: client.phone,
          email: client.email,
          vehicles: []
        }
        onNextAction({ client: convertedClient })
      }
    } catch (error) {
      console.error('Failed to create client:', error)
    }
  }

  return (
    <motion.div
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.4, type: "spring" }}
    >
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-card via-card to-card/90 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="w-6 h-6 text-primary" />
            </div>
            Выберите клиента
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по имени или телефону..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-8"
              >
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Поиск клиентов...</span>
              </motion.div>
            ) : searchResults.length > 0 ? (
              <motion.div
                key="results"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-3 max-h-60 overflow-y-auto"
              >
                {searchResults.map((client) => (
                  <motion.div
                    key={client._id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectClient(client)}
                    className="p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-accent/50 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {client.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {client.phone}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {client.vehicles?.length || 0} авто
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : searchQuery.length >= 3 ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-8"
              >
                <div className="text-muted-foreground mb-4">Клиент не найден</div>
                <Button
                  onClick={() => setShowAddForm(true)}
                  variant="outline"
                  className="bg-background/50 backdrop-blur"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Создать нового клиента
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-border pt-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Новый клиент</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <Input
                    placeholder="Имя клиента"
                    value={newClient.name}
                    onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                    className="h-12"
                  />
                  <Input
                    placeholder="Телефон"
                    value={newClient.phone}
                    onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                    className="h-12"
                  />
                  <Input
                    placeholder="Email (необязательно)"
                    value={newClient.email}
                    onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                    className="h-12"
                  />
                  <Button 
                    onClick={handleCreateClient}
                    disabled={!newClient.name || !newClient.phone}
                    className="w-full h-12 bg-primary hover:bg-primary/90"
                  >
                    Создать и продолжить
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}