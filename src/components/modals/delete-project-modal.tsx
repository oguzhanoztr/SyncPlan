"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle } from "lucide-react"

interface Project {
  id: string
  name: string
  description?: string
}

interface DeleteProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project | null
  onSuccess: () => void
}

export function DeleteProjectModal({
  isOpen,
  onClose,
  project,
  onSuccess
}: DeleteProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [confirmationText, setConfirmationText] = useState("")

  const handleDelete = async () => {
    if (!project || confirmationText !== project.name) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onSuccess()
        onClose()
        setConfirmationText("")
      } else {
        const error = await response.json()
        console.error('Error deleting project:', error)
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setConfirmationText("")
      onClose()
    }
  }

  const isConfirmed = confirmationText === project?.name

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Project
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the project
            and all associated tasks and data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-destructive/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Deleting "{project?.name}" will also delete:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All tasks and subtasks</li>
                <li>All project data and history</li>
                <li>Team member access</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Type "<strong>{project?.name}</strong>" to confirm deletion:
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={project?.name}
              disabled={isLoading}
              className="font-mono"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}