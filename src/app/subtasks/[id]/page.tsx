"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Layout } from "@/components/layout/layout"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Loader2
} from "lucide-react"
import Link from "next/link"

interface Subtask {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  position: number
  createdAt: string
  updatedAt: string
  task: {
    id: string
    title: string
    project: {
      id: string
      name: string
    }
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

export default function SubtaskDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const subtaskId = params.id as string

  const [subtask, setSubtask] = useState<Subtask | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSubtask()
  }, [subtaskId, session?.user?.id])

  const fetchSubtask = async () => {
    if (!subtaskId || !session?.user?.id) return

    try {
      const response = await fetch(`/api/subtasks/${subtaskId}`)
      if (response.ok) {
        const data = await response.json()
        setSubtask(data.subtask)
      } else if (response.status === 404) {
        // Redirect to parent task if subtask doesn't exist
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching subtask:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }


  useEffect(() => {
    // Redirect to parent task when subtask is viewed
    if (subtask?.task?.id) {
      router.replace(`/tasks/${subtask.task.id}`)
    }
  }, [subtask, router])

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    )
  }

  if (!subtask) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Subtask not found</h2>
            <p className="text-muted-foreground mb-4">The subtask you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
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

  return null // This will redirect to parent task
}