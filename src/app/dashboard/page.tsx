"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Layout } from "@/components/layout/layout"
import { ProjectCard } from "@/components/common/project-card"
import { TaskCard } from "@/components/common/task-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, TrendingUp, Clock, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"

const mockProjects = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete redesign of company website with modern UI/UX",
    status: "active" as const,
    progress: 65,
    totalTasks: 24,
    completedTasks: 16,
    dueDate: "Dec 15",
    members: [
      { id: "1", name: "John Doe", avatar: "/avatar1.jpg" },
      { id: "2", name: "Jane Smith", avatar: "/avatar2.jpg" },
      { id: "3", name: "Mike Johnson" },
    ],
    color: "bg-blue-500"
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "React Native app for iOS and Android platforms",
    status: "active" as const,
    progress: 30,
    totalTasks: 18,
    completedTasks: 5,
    dueDate: "Jan 30",
    members: [
      { id: "4", name: "Sarah Wilson" },
      { id: "5", name: "Tom Brown" },
    ],
    color: "bg-green-500"
  },
]

const mockTasks = [
  {
    id: "1",
    title: "Design new homepage layout",
    description: "Create wireframes and mockups for the new homepage design",
    status: "in-progress" as const,
    priority: "high" as const,
    assignee: { id: "1", name: "John Doe", avatar: "/avatar1.jpg" },
    dueDate: "Dec 10",
    estimatedHours: 8,
    tags: ["design", "frontend"],
    commentsCount: 3,
    attachmentsCount: 2
  },
  {
    id: "2",
    title: "Set up authentication system",
    description: "Implement login, signup, and password reset functionality",
    status: "todo" as const,
    priority: "medium" as const,
    assignee: { id: "2", name: "Jane Smith" },
    dueDate: "Dec 12",
    estimatedHours: 12,
    tags: ["backend", "auth"],
    commentsCount: 1
  },
]

interface Project {
  id: string
  name: string
  description?: string
  status: string
  dueDate?: string
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
    status: string
    priority: string
    dueDate?: string
  }>
  _count: {
    tasks: number
  }
}

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
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

export default function DashboardPage() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    teamMembers: 0,
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user?.id) return

      try {
        const [projectsRes, tasksRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/tasks')
        ])

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          setProjects(projectsData.projects || [])

          // Calculate stats
          const totalProjects = projectsData.projects?.length || 0
          const allTasks = projectsData.projects?.flatMap((p: Project) => p.tasks) || []
          const activeTasks = allTasks.filter((t: any) => t.status !== 'COMPLETED').length
          const completedTasks = allTasks.filter((t: any) => t.status === 'COMPLETED').length
          const uniqueMembers = new Set()

          projectsData.projects?.forEach((p: Project) => {
            uniqueMembers.add(p.owner.id)
            p.members.forEach(m => uniqueMembers.add(m.user.id))
          })

          setStats({
            totalProjects,
            activeTasks,
            completedTasks,
            teamMembers: uniqueMembers.size,
          })
        }

        if (tasksRes.ok) {
          const tasksData = await tasksRes.json()
          setTasks(tasksData.tasks?.slice(0, 5) || []) // Show only recent 5 tasks
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [session?.user?.id])

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
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session?.user?.name || "User"}! Here's what's happening with your projects.
            </p>
          </div>
          <Button asChild>
            <Link href="/projects">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalProjects > 0 ? "Active projects" : "No projects yet"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeTasks}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeTasks > 0 ? "In progress" : "All caught up!"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedTasks > 0 ? "Tasks finished" : "No completed tasks"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.teamMembers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.teamMembers > 1 ? "Collaborating" : "Solo work"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Projects</h2>
            <div className="space-y-4">
              {projects.length > 0 ? (
                projects.slice(0, 3).map((project) => (
                  <ProjectCard
                    key={project.id}
                    id={project.id}
                    name={project.name}
                    description={project.description || ""}
                    status={project.status as "active" | "completed" | "on-hold"}
                    progress={project._count.tasks > 0 ?
                      (project.tasks.filter(t => t.status === 'COMPLETED').length / project._count.tasks) * 100 : 0
                    }
                    totalTasks={project._count.tasks}
                    completedTasks={project.tasks.filter(t => t.status === 'COMPLETED').length}
                    dueDate={project.dueDate ? new Date(project.dueDate).toLocaleDateString() : ""}
                    members={[
                      {
                        id: project.owner.id,
                        name: project.owner.name || project.owner.email,
                        avatar: project.owner.avatar
                      },
                      ...project.members.map(m => ({
                        id: m.user.id,
                        name: m.user.name || m.user.email,
                        avatar: m.user.avatar
                      }))
                    ]}
                    color="bg-blue-500"
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No projects yet. Create your first project to get started!</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Tasks</h2>
            <div className="space-y-4">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description || ""}
                    status={task.status.toLowerCase() as "todo" | "in-progress" | "completed"}
                    priority={task.priority.toLowerCase() as "low" | "medium" | "high" | "urgent"}
                    assignee={task.assignee ? {
                      id: task.assignee.id,
                      name: task.assignee.name || task.assignee.email,
                      avatar: task.assignee.avatar
                    } : undefined}
                    dueDate={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ""}
                    estimatedHours={0}
                    tags={[task.project.name]}
                    commentsCount={0}
                    attachmentsCount={0}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tasks assigned to you yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}