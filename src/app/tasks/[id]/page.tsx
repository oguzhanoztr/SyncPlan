"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Layout } from "@/components/layout/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  ArrowLeft,
  Plus,
  Edit,
  Clock,
  User,
  Calendar,
  Flag,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  MessageSquare,
  Paperclip,
  Loader2
} from "lucide-react"
import Link from "next/link"

const createSubtaskSchema = z.object({
  title: z.string().min(1, "Subtask title is required"),
  description: z.string().optional(),
})

const updateTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string().optional(),
})

const commentSchema = z.object({
  comment: z.string().min(1, "Comment cannot be empty"),
})

type CreateSubtaskData = z.infer<typeof createSubtaskSchema>
type UpdateTaskData = z.infer<typeof updateTaskSchema>
type CommentData = z.infer<typeof commentSchema>

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  tags: string[]
  position: number
  createdAt: string
  updatedAt: string
  project: {
    id: string
    name: string
  }
  assignee?: {
    id: string
    name?: string
    email: string
    avatar?: string
  }
  creator: {
    id: string
    name?: string
    email: string
    avatar?: string
  }
  parentTask?: {
    id: string
    title: string
  }
  subtasks: Array<{
    id: string
    title: string
    description?: string
    status: string
    priority: string
    dueDate?: string
    assignee?: {
      id: string
      name?: string
      email: string
      avatar?: string
    }
  }>
}

export default function TaskDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const taskId = params.id as string

  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCreatingSubtask, setIsCreatingSubtask] = useState(false)
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false)

  const subtaskForm = useForm<CreateSubtaskData>({
    resolver: zodResolver(createSubtaskSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  const updateForm = useForm<UpdateTaskData>({
    resolver: zodResolver(updateTaskSchema),
  })

  const commentForm = useForm<CommentData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      comment: "",
    },
  })

  useEffect(() => {
    fetchTask()
  }, [taskId, session?.user?.id])

  const fetchTask = async () => {
    if (!taskId || !session?.user?.id) return

    try {
      const response = await fetch(`/api/tasks/${taskId}`)
      if (response.ok) {
        const data = await response.json()
        setTask(data.task)

        // Set form default values
        if (data.task) {
          updateForm.reset({
            title: data.task.title,
            description: data.task.description || "",
            status: data.task.status,
            priority: data.task.priority,
            dueDate: data.task.dueDate ? new Date(data.task.dueDate).toISOString().split('T')[0] : "",
          })
        }
      }
    } catch (error) {
      console.error('Error fetching task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTask = async (data: UpdateTaskData) => {
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        setTask(result.task)
        setIsEditDialogOpen(false)
      }
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCreateSubtask = async (data: CreateSubtaskData) => {
    setIsCreatingSubtask(true)

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          projectId: task?.project.id,
          parentTaskId: taskId,
          priority: 'MEDIUM',
        }),
      })

      if (response.ok) {
        await fetchTask() // Refresh task data
        setIsSubtaskDialogOpen(false)
        subtaskForm.reset()
      }
    } catch (error) {
      console.error('Error creating subtask:', error)
    } finally {
      setIsCreatingSubtask(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...task,
          status: newStatus,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setTask(result.task)
      }
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'destructive'
      case 'HIGH':
        return 'default'
      case 'MEDIUM':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    )
  }

  if (!task) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Task not found</h2>
            <p className="text-muted-foreground mb-4">The task you're looking for doesn't exist or you don't have access to it.</p>
            <Button asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/projects/${task.project.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {task.project.name}
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Task Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <h1 className="text-2xl font-bold">{task.title}</h1>
                    </div>
                    {task.description && (
                      <p className="text-muted-foreground">{task.description}</p>
                    )}
                  </div>
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                        <DialogDescription>
                          Update the task details and settings.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={updateForm.handleSubmit(handleUpdateTask)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            {...updateForm.register("title")}
                            disabled={isUpdating}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            {...updateForm.register("description")}
                            disabled={isUpdating}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                              value={updateForm.watch("status")}
                              onValueChange={(value) => updateForm.setValue("status", value as any)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="TODO">To Do</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                              value={updateForm.watch("priority")}
                              onValueChange={(value) => updateForm.setValue("priority", value as any)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LOW">Low</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="URGENT">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dueDate">Due Date</Label>
                          <Input
                            id="dueDate"
                            type="date"
                            {...updateForm.register("dueDate")}
                            disabled={isUpdating}
                          />
                        </div>

                        <DialogFooter>
                          <Button type="submit" disabled={isUpdating}>
                            {isUpdating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              "Update Task"
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
            </Card>

            {/* Subtasks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Subtasks ({task.subtasks?.length || 0})</CardTitle>
                  <Dialog open={isSubtaskDialogOpen} onOpenChange={setIsSubtaskDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Subtask
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Subtask</DialogTitle>
                        <DialogDescription>
                          Add a new subtask to break down this task into smaller components.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={subtaskForm.handleSubmit(handleCreateSubtask)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="subtask-title">Title</Label>
                          <Input
                            id="subtask-title"
                            {...subtaskForm.register("title")}
                            placeholder="Enter subtask title"
                            disabled={isCreatingSubtask}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subtask-description">Description</Label>
                          <Textarea
                            id="subtask-description"
                            {...subtaskForm.register("description")}
                            placeholder="Describe the subtask..."
                            disabled={isCreatingSubtask}
                          />
                        </div>

                        <DialogFooter>
                          <Button type="submit" disabled={isCreatingSubtask}>
                            {isCreatingSubtask ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              "Create Subtask"
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {task.subtasks && task.subtasks.length > 0 ? (
                  <div className="space-y-3">
                    {task.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <button
                          onClick={() => handleStatusChange(subtask.status === 'COMPLETED' ? 'TODO' : 'COMPLETED')}
                          className="flex-shrink-0"
                        >
                          {getStatusIcon(subtask.status)}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${subtask.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`}>
                              {subtask.title}
                            </span>
                            <Badge variant={getPriorityColor(subtask.priority)} className="text-xs">
                              {subtask.priority}
                            </Badge>
                          </div>
                          {subtask.description && (
                            <p className="text-sm text-muted-foreground mt-1">{subtask.description}</p>
                          )}
                        </div>
                        {subtask.assignee && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={subtask.assignee.avatar || ""} />
                            <AvatarFallback className="text-xs">
                              {subtask.assignee.name?.charAt(0) || subtask.assignee.email.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No subtasks yet. Add a subtask to break down this task.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Task Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Select value={task.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="w-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Priority</span>
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>

                  {task.assignee && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Assignee</span>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.assignee.avatar || ""} />
                          <AvatarFallback className="text-xs">
                            {task.assignee.name?.charAt(0) || task.assignee.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{task.assignee.name || task.assignee.email}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Creator</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={task.creator.avatar || ""} />
                        <AvatarFallback className="text-xs">
                          {task.creator.name?.charAt(0) || task.creator.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{task.creator.name || task.creator.email}</span>
                    </div>
                  </div>

                  {task.dueDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Due Date</span>
                      <span className="text-sm">{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Created</span>
                    <span className="text-sm">{new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Updated</span>
                    <span className="text-sm">{new Date(task.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/projects/${task.project.id}`}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <span>{task.project.name}</span>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}