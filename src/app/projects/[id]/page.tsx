"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { Layout } from "@/components/layout/layout"
import { TaskCard } from "@/components/common/task-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, ArrowLeft, Calendar, Users, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
  dueDate: z.string().optional(),
})

type CreateTaskData = z.infer<typeof createTaskSchema>

interface Project {
  id: string
  name: string
  description?: string
  status: string
  dueDate?: string
  createdAt: string
  owner: {
    id: string
    name?: string
    email: string
    avatar?: string
  }
  members: Array<{
    user: {
      id: string
      name?: string
      email: string
      avatar?: string
    }
  }>
  tasks: Array<{
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
    creator: {
      id: string
      name?: string
      email: string
      avatar?: string
    }
  }>
}

export default function ProjectDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [taskFilter, setTaskFilter] = useState("all")

  const form = useForm<CreateTaskData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: "",
    },
  })

  useEffect(() => {
    fetchProject()
  }, [projectId, session?.user?.id])

  const fetchProject = async () => {
    if (!projectId || !session?.user?.id) return

    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data.project)
      }
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = async (data: CreateTaskData) => {
    setIsCreatingTask(true)

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          projectId,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setProject(prev => prev ? {
          ...prev,
          tasks: [result.task, ...prev.tasks]
        } : null)
        setIsDialogOpen(false)
        form.reset()
      } else {
        const error = await response.json()
        console.error('Error creating task:', error)
      }
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setIsCreatingTask(false)
    }
  }

  const getFilteredTasks = () => {
    if (!project) return []

    if (taskFilter === "all") return project.tasks
    return project.tasks.filter(task => task.status === taskFilter)
  }

  const getTaskStats = () => {
    if (!project) return { total: 0, todo: 0, inProgress: 0, completed: 0 }

    const total = project.tasks.length
    const todo = project.tasks.filter(t => t.status === 'TODO').length
    const inProgress = project.tasks.filter(t => t.status === 'IN_PROGRESS').length
    const completed = project.tasks.filter(t => t.status === 'COMPLETED' || t.status === 'DONE').length

    return { total, todo, inProgress, completed }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'HIGH':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'MEDIUM':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
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

  if (!project) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Project not found</h2>
            <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist or you don't have access to it.</p>
            <Button asChild>
              <Link href="/projects">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  const stats = getTaskStats()
  const filteredTasks = getFilteredTasks()

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground max-w-2xl">{project.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Created {new Date(project.createdAt).toLocaleDateString()}
              </div>
              {project.dueDate && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Due {new Date(project.dueDate).toLocaleDateString()}
                </div>
              )}
              <Badge variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {project.status}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Add a new task to {project.name}.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleCreateTask)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Task Title</Label>
                    <Input
                      id="title"
                      {...form.register("title")}
                      placeholder="Enter task title"
                      disabled={isCreatingTask}
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...form.register("description")}
                      placeholder="Describe the task..."
                      disabled={isCreatingTask}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={form.watch("priority")}
                        onValueChange={(value) => form.setValue("priority", value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        {...form.register("dueDate")}
                        disabled={isCreatingTask}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="submit" disabled={isCreatingTask}>
                      {isCreatingTask ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Task"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">To Do</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.todo}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={project.owner.avatar || ""} />
                  <AvatarFallback>
                    {project.owner.name
                      ? project.owner.name.split(' ').map(n => n[0]).join('').toUpperCase()
                      : project.owner.email.charAt(0).toUpperCase()
                    }
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{project.owner.name || project.owner.email}</p>
                  <p className="text-xs text-muted-foreground">Owner</p>
                </div>
              </div>
              {(project.members || []).map((member) => (
                <div key={member.user.id} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.user.avatar || ""} />
                    <AvatarFallback>
                      {member.user.name
                        ? member.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
                        : member.user.email.charAt(0).toUpperCase()
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.user.name || member.user.email}</p>
                    <p className="text-xs text-muted-foreground">Member</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tasks</h2>
            <Tabs value={taskFilter} onValueChange={setTaskFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="TODO">To Do</TabsTrigger>
                <TabsTrigger value="IN_PROGRESS">In Progress</TabsTrigger>
                <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description || ""}
                  status={task.status === 'TODO' ? 'todo' : task.status === 'IN_PROGRESS' ? 'in-progress' : task.status === 'COMPLETED' ? 'completed' : task.status === 'REVIEW' ? 'review' : task.status === 'DONE' ? 'done' : 'todo'}
                  priority={task.priority.toLowerCase() as "low" | "medium" | "high" | "urgent"}
                  assignee={task.assignee ? {
                    id: task.assignee.id,
                    name: task.assignee.name || task.assignee.email,
                    avatar: task.assignee.avatar
                  } : undefined}
                  dueDate={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ""}
                  estimatedHours={0}
                  tags={[]}
                  commentsCount={0}
                  attachmentsCount={0}
                />
              ))
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                      <p className="text-muted-foreground mb-4">
                        {taskFilter !== "all"
                          ? `No ${taskFilter.toLowerCase().replace('_', ' ')} tasks in this project.`
                          : "This project doesn't have any tasks yet."
                        }
                      </p>
                      {taskFilter === "all" && (
                        <Button onClick={() => setIsDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create First Task
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}