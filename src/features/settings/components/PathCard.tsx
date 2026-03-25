import { useState } from 'react'

import { Edit, Save, Trash2, X } from 'lucide-react'
import type { PathItem } from '../Settings'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export const PathCard = ({
  item,
  isEditing,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  tVar,
}: {
  item: PathItem
  isEditing: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onSave: (id: string, path: string, description: string) => void
  onCancel: () => void
  tVar: (key: string) => string
}) => {
  const [editPath, setEditPath] = useState(item.path)
  const [editDescription, setEditDescription] = useState(item.description)

  if (isEditing) {
    return (
      <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
        <Input value={editPath} onChange={(e) => setEditPath(e.target.value)} />
        <Textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          rows={3}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onSave(item.id as string, editPath, editDescription)}
          >
            <Save className="mr-2 h-4 w-4" />
            {tVar('paths.saved_paths.button.save')}
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            {tVar('paths.saved_paths.button.cancel')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm font-medium text-primary break-all">
            {item.path}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {item.description || 'No description'}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(item.id as string)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(item.id as string)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  )
}
