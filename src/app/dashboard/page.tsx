"use client"

import { useSession } from "next-auth/react"
import { Layout } from "@/components/layout/layout"
import { ProjectCard } from "@/components/common/project-card"
import { TaskCard } from "@/components/common/task-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, TrendingUp, Clock, CheckCircle2 } from "lucide-react"

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

export default function DashboardPage() {
  const { data: session } = useSession()

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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">
                +7 from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128</div>
              <p className="text-xs text-muted-foreground">
                +12 this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                +1 new member
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Projects</h2>
            <div className="space-y-4">
              {mockProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Tasks</h2>
            <div className="space-y-4">
              {mockTasks.map((task) => (
                <TaskCard key={task.id} {...task} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}