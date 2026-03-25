import { useContext, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { PathCard } from './components/PathCard'
import { validatePath } from './utils/pathValidation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Toaster } from '@/components/ui/sonner'
import { ApiContext } from '@/context/ApiContext'
import { Spinner } from '@/components/ui/spinner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export interface PathItem {
  id?: string
  path: string
  description: string
}

const Settings = () => {
  const { t: tS } = useTranslation('translation', {
    keyPrefix: 'Settings',
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [newPath, setNewPath] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const {
    addPath,
    updatePath,
    deletePath,
    paths: pathsData,
    isPending,
  } = useContext(ApiContext)

  const handleAdd = () => {
    const validation = validatePath(newPath)

    if (!validation.valid) {
      toast(tS('paths.toasts.invalid_path'), {
        description: validation.error,
      })
      return
    }

    const addItem: PathItem = {
      path: newPath,
      description: newDescription,
    }

    addPath(addItem, {
      onSuccess: () => {
        setNewPath('')
        setNewDescription('')
        toast(tS('paths.toasts.path_added.label'), {
          description: tS('paths.toasts.path_added.description'),
        })
      },
      onError: (error)=>{
        toast(tS('paths.toasts.path_add_failed'), {
          description: error.message
        })
      }
    })
  }

  const handleDelete = (id: string) => {
    setDeletingId(id)
  }

  const confirmDelete = () => {
    if (deletingId) {
      deletePath(deletingId, {
        onSuccess: () => {
          toast(tS('paths.toasts.path_deleted.label'), {
            description: tS('paths.toasts.path_deleted.description'),
          })
        },
      })
      setDeletingId(null)
    }
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
  }

  const handleSave = (
    id: string,
    updatedPath: string,
    updatedDescription: string,
  ) => {
    const validation = validatePath(updatedPath)

    if (!validation.valid) {
      toast(tS('paths.toasts.invalid_path'), {
        description: validation.error,
      })
      return
    }

    updatePath(
      {
        id,
        path: updatedPath,
        description: updatedDescription,
      },
      {
        onSuccess: () => {
          setEditingId(null)
          toast(tS('paths.toasts.path_updated.label'), {
            description: tS('paths.toasts.path_updated.description'),
          })
        },
      },
    )
  }

  const handleCancel = () => {
    setEditingId(null)
  }

  return (
    <div className="max-w-4xl mx-auto mt-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{tS('title')}</h1>
        <p className="text-muted-foreground">{tS('sub_title')}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{tS('paths.add_path.title')}</CardTitle>
          <CardDescription>{tS('paths.add_path.sub_title')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {tS('paths.add_path.input_path.label')}
            </label>
            <div className="flex gap-2">
              <Input
                placeholder={tS('paths.add_path.input_path.placeholder')}
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {tS('paths.add_path.input_description.label')}
            </label>
            <Textarea
              placeholder={tS('paths.add_path.input_description.placeholder')}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Button onClick={handleAdd} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            {tS('paths.add_path.button')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {tS('paths.saved_paths.title')} ({pathsData.length})
          </CardTitle>
          <CardDescription>{tS('paths.saved_paths.sub_title')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="flex justify-center py-8">
              <Spinner className="size-8" />
            </div>
          ) : (
            <div className="space-y-4">
              {pathsData.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {tS('paths.saved_paths.no_paths')}
                </p>
              ) : (
                pathsData.map((item: PathItem) => (
                  <PathCard
                    key={item.id}
                    item={item}
                    isEditing={editingId === item.id}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    tVar={tS}
                  />
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <Toaster position="top-center" />
      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tS('paths.saved_paths.confirm.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tS('paths.saved_paths.confirm.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {tS('paths.saved_paths.button.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {tS('paths.saved_paths.button.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Settings
