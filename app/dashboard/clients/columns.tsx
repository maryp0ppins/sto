'use client'

import { ColumnDef } from '@tanstack/react-table'
import type { Client } from '@/types'
import ActionCell from '@/components/ActionCell'

export const columns: ColumnDef<Client & {
  onEdit?: (c: Client) => void
  onDelete?: (id: string) => void
}>[] = [
  {
    accessorKey: 'name',
    header: 'Имя',
  },
  {
    accessorKey: 'phone',
    header: 'Телефон',
  },
  {
    accessorFn: row => row.vehicles?.map(v => `${v.make} ${v.model} (${v.licensePlate})`).join(', ') || '',
    id: 'vehicles',
    header: 'Машины',
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <ActionCell
        client={row.original}
        onEdit={row.original.onEdit}
        onDelete={row.original.onDelete}
      />
    ),
  },
]
