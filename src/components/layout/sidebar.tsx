"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  FolderKanban,
  Calendar,
  BarChart3,
  Settings,
  Plus
} from "lucide-react"

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

const recentProjects = [
  { name: "Website Redesign", tasks: 12 },
  { name: "Mobile App", tasks: 8 },
  { name: "Marketing Campaign", tasks: 5 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="pb-12 w-64 border-r bg-background">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {sidebarNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                      pathname === item.href && "bg-muted text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="px-4 text-lg font-semibold tracking-tight">
              Recent Projects
            </h2>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-1">
            {recentProjects.map((project) => (
              <Link
                key={project.name}
                href={`/projects/${project.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center justify-between rounded-lg px-4 py-2 text-sm hover:bg-muted"
              >
                <span className="truncate">{project.name}</span>
                <Badge variant="secondary" className="ml-2">
                  {project.tasks}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}