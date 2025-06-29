'use client'

import type { Client } from '@/types'
import { Button } from '@/components/ui/button'

type Props = {
  client: Client
  onEdit?: (client: Client) => void
  onDelete?: (id: string) => void
}

export default function ActionCell({ client, onEdit, onDelete }: Props) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onEdit?.(client)}
      >
        ✏️
      </Button>
      <Button
        variant="destructive"
        size="icon"
        onClick={() => client._id && onDelete?.(client._id)}
      >
        🗑️
      </Button>
    </div>
  )
}
