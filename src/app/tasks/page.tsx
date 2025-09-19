"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Layout } from "@/components/layout/layout"
import { TaskCard } from "@/components/common/task-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Clock, CheckCircle2, Circle, AlertCircle, Loader2 } from "lucide-react"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  estimatedHours?: number
  tags: string[]
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
}

export default function TasksPage() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")

  useEffect(() => {
    fetchTasks()
  }, [session?.user?.id])

  useEffect(() => {
    filterTasks()
  }, [tasks, searchTerm, statusFilter, priorityFilter, projectFilter])

  const fetchTasks = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterTasks = () => {
    let filtered = tasks

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.project.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(task => task.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(task => task.priority === priorityFilter)
    }

    if (projectFilter !== "all") {
      filtered = filtered.filter(task => task.project.id === projectFilter)
    }

    setFilteredTasks(filtered)
  }

  const getTaskStats = () => {
    const total = tasks.length
    const todo = tasks.filter(t => t.status === 'TODO').length
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length
    const completed = tasks.filter(t => t.status === 'COMPLETED').length

    return { total, todo, inProgress, completed }
  }

  const getUniqueProjects = () => {
    const projects = tasks.map(task => task.project)
    const uniqueProjects = projects.filter((project, index, self) =>
      index === self.findIndex(p => p.id === project.id)
    )
    return uniqueProjects
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-600'
      case 'HIGH':
        return 'text-orange-600'
      case 'MEDIUM':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const mapStatusForCard = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'todo'
      case 'IN_PROGRESS':
        return 'in-progress'
      case 'COMPLETED':
        return 'completed'
      default:
        return 'todo'
    }
  }

  const mapPriorityForCard = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'low'
      case 'MEDIUM':
        return 'medium'
      case 'HIGH':
        return 'high'
      case 'URGENT':
        return 'urgent'
      default:
        return 'medium'
    }
  }

  const stats = getTaskStats()
  const uniqueProjects = getUniqueProjects()

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Tasks</h1>
            <p className="text-muted-foreground">
              View and manage all your assigned tasks across projects.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
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

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {uniqueProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tasks List */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Tasks ({filteredTasks.length})</TabsTrigger>
            <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
            <TabsTrigger value="created">Created by Me</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredTasks.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description || ""}
                    status={mapStatusForCard(task.status)}
                    priority={mapPriorityForCard(task.priority)}
                    assignee={task.assignee ? {
                      id: task.assignee.id,
                      name: task.assignee.name || task.assignee.email,
                      avatar: task.assignee.avatar
                    } : undefined}
                    dueDate={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ""}
                    estimatedHours={task.estimatedHours}
                    tags={[task.project.name, ...task.tags]}
                    commentsCount={0}
                    attachmentsCount={0}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== "all" || priorityFilter !== "all" || projectFilter !== "all"
                        ? "Try adjusting your search or filters."
                        : "You don't have any tasks yet."
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="assigned" className="space-y-4">
            {filteredTasks.filter(task => task.assignee?.id === session?.user?.id).length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTasks
                  .filter(task => task.assignee?.id === session?.user?.id)
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      id={task.id}
                      title={task.title}
                      description={task.description || ""}
                      status={mapStatusForCard(task.status)}
                      priority={mapPriorityForCard(task.priority)}
                      assignee={task.assignee ? {
                        id: task.assignee.id,
                        name: task.assignee.name || task.assignee.email,
                        avatar: task.assignee.avatar
                      } : undefined}
                      dueDate={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ""}
                      estimatedHours={task.estimatedHours}
                      tags={[task.project.name, ...task.tags]}
                      commentsCount={0}
                      attachmentsCount={0}
                    />
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">No assigned tasks</h3>
                    <p className="text-muted-foreground">You don't have any tasks assigned to you.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="created" className="space-y-4">
            {filteredTasks.filter(task => task.creator.id === session?.user?.id).length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTasks
                  .filter(task => task.creator.id === session?.user?.id)
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      id={task.id}
                      title={task.title}
                      description={task.description || ""}
                      status={mapStatusForCard(task.status)}
                      priority={mapPriorityForCard(task.priority)}
                      assignee={task.assignee ? {
                        id: task.assignee.id,
                        name: task.assignee.name || task.assignee.email,
                        avatar: task.assignee.avatar
                      } : undefined}
                      dueDate={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ""}
                      estimatedHours={task.estimatedHours}
                      tags={[task.project.name, ...task.tags]}
                      commentsCount={0}
                      attachmentsCount={0}
                    />
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">No created tasks</h3>
                    <p className="text-muted-foreground">You haven't created any tasks yet.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}