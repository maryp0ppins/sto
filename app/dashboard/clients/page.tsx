'use client'

import { useEffect, useState } from 'react'
import type { Client } from '@/types'
import { columns } from './columns'
import { DataTable } from './DataTable'
import { Button } from '@/components/ui/button'
import { ClientEditor } from './ClientEditor'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [editing, setEditing] = useState<Client | null>(null)

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(setClients)
  }, [])

  const save = async (client: Client) => {
    const method = client._id ? 'PUT' : 'POST'
    await fetch('/api/clients', {
      method,
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(client)
    })
    setClients(await fetch('/api/clients').then(r => r.json()))
    setEditing(null)
  }

  const del = async (id: string) => {
    await fetch(`/api/clients?id=${id}`, { method: 'DELETE' })
    setClients(clients.filter(c => c._id !== id))
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Клиенты</h1>
        <Button onClick={() => setEditing({ name:'', phone:'', vehicles:[] })}>
          Добавить клиента
        </Button>
      </div>
      <DataTable columns={columns} data={clients.map(c => ({ ...c, onDelete: del, onEdit: () => setEditing(c) }))} />
      {editing && <ClientEditor client={editing} onSave={save} onCancel={() => setEditing(null)} />}
    </div>
  )
}
