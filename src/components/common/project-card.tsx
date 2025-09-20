"use client"

import Link from "next/link"
import { useState } from "react"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Users, CheckCircle2, MoreVertical, Edit, Trash2 } from "lucide-react"

interface ProjectCardProps {
  id: string
  name: string
  description?: string
  status: "active" | "completed" | "archived" | "on-hold"
  progress: number
  totalTasks: number
  completedTasks: number
  dueDate?: string
  members: Array<{
    id: string
    name: string
    avatar?: string
  }>
  color?: string
  isOwner?: boolean
  canEdit?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function ProjectCard({
  id,
  name,
  description,
  status,
  progress,
  totalTasks,
  completedTasks,
  dueDate,
  members,
  color = "bg-blue-500",
  isOwner = false,
  canEdit = false,
  onEdit,
  onDelete
}: ProjectCardProps) {
  const statusColors = {
    active: "bg-green-500",
    completed: "bg-blue-500",
    archived: "bg-gray-500",
    "on-hold": "bg-orange-500"
  }

  const statusLabels = {
    active: "Active",
    completed: "Completed",
    archived: "Archived",
    "on-hold": "On Hold"
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit?.(id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete?.(id)
  }

  return (
    <Link href={`/projects/${id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <h3 className="font-semibold text-lg leading-none">{name}</h3>
              </div>
              {description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={`${statusColors[status]} text-white`}
              >
                {statusLabels[status]}
              </Badge>
              {(canEdit || isOwner) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canEdit && (
                      <DropdownMenuItem onClick={handleEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {isOwner && (
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>{completedTasks}/{totalTasks} tasks</span>
              </div>

              {dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{dueDate}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {members.length} member{members.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex -space-x-2">
              {members.slice(0, 3).map((member) => (
                <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-xs">
                    {member.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {members.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    +{members.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}