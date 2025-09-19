"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MessageSquare, Paperclip } from "lucide-react"
import Link from "next/link"

interface TaskCardProps {
  id: string
  title: string
  description?: string
  status: "todo" | "in-progress" | "review" | "done" | "completed"
  priority: "low" | "medium" | "high" | "urgent"
  assignee?: {
    id: string
    name: string
    avatar?: string
  }
  dueDate?: string
  estimatedHours?: number
  tags?: string[]
  commentsCount?: number
  attachmentsCount?: number
}

export function TaskCard({
  id,
  title,
  description,
  status,
  priority,
  assignee,
  dueDate,
  estimatedHours,
  tags = [],
  commentsCount = 0,
  attachmentsCount = 0
}: TaskCardProps) {
  const statusColors = {
    todo: "bg-gray-500",
    "in-progress": "bg-blue-500",
    review: "bg-yellow-500",
    done: "bg-green-500",
    completed: "bg-green-500"
  }

  const priorityColors = {
    low: "border-l-green-500",
    medium: "border-l-yellow-500",
    high: "border-l-orange-500",
    urgent: "border-l-red-500"
  }

  const statusLabels = {
    todo: "To Do",
    "in-progress": "In Progress",
    review: "Review",
    done: "Done",
    completed: "Completed"
  }

  return (
    <Link href={`/tasks/${id}`}>
      <Card className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${priorityColors[priority]}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <h4 className="font-medium leading-tight line-clamp-2">{title}</h4>
            <Badge
              variant="secondary"
              className={`${statusColors[status]} text-white text-xs ml-2`}
            >
              {statusLabels[status]}
            </Badge>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {description}
            </p>
          )}
        </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{dueDate}</span>
                </div>
              )}
              {estimatedHours && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{estimatedHours}h</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {commentsCount > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{commentsCount}</span>
                </div>
              )}
              {attachmentsCount > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  <span>{attachmentsCount}</span>
                </div>
              )}
            </div>
          </div>

          {assignee && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Assigned to:</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{assignee.name}</span>
                <Avatar className="h-5 w-5">
                  <AvatarImage src={assignee.avatar} />
                  <AvatarFallback className="text-xs">
                    {assignee.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </Link>
  )
}