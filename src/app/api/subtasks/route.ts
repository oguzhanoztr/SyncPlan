import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cache, generateCacheKey, invalidateCache } from '@/lib/cache'
import { z } from 'zod'

const createSubtaskSchema = z.object({
  title: z.string().min(1, "Subtask title is required"),
  description: z.string().optional(),
  taskId: z.string().min(1, "Task ID is required"),
  assigneeId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
  dueDate: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createSubtaskSchema.parse(body)

    // Check if parent task exists and user has access
    const parentTask = await prisma.task.findFirst({
      where: {
        id: validatedData.taskId,
        OR: [
          { project: { ownerId: session.user.id } },
          { assigneeId: session.user.id },
          { creatorId: session.user.id },
          {
            project: {
              members: {
                some: { userId: session.user.id }
              }
            }
          }
        ]
      }
    })

    if (!parentTask) {
      return NextResponse.json(
        { error: 'Parent task not found or access denied' },
        { status: 404 }
      )
    }

    // Get the highest position for the task's subtasks to append the new one
    const maxPosition = await prisma.subtask.findFirst({
      where: { taskId: validatedData.taskId },
      orderBy: { position: 'desc' },
      select: { position: true }
    })

    // Create subtask
    const subtask = await prisma.subtask.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        taskId: validatedData.taskId,
        assigneeId: validatedData.assigneeId,
        priority: validatedData.priority,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        creatorId: session.user.id,
        position: (maxPosition?.position || 0) + 1,
      },
      include: {
        task: {
          select: { id: true, title: true }
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        creator: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    })

    // Invalidate subtask cache
    invalidateCache.subtask(validatedData.taskId)

    return NextResponse.json({
      message: 'Subtask created successfully',
      subtask
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating subtask:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    // Check cache first
    const cacheKey = generateCacheKey.subtasks(taskId, session.user.id)
    const cachedSubtasks = cache.get(cacheKey)

    if (cachedSubtasks) {
      return NextResponse.json({ subtasks: cachedSubtasks })
    }

    // Use optimized Prisma query
    const subtasks = await prisma.subtask.findMany({
      where: {
        taskId: taskId,
        task: {
          OR: [
            { project: { ownerId: session.user.id } },
            { assigneeId: session.user.id },
            { creatorId: session.user.id },
            {
              project: {
                members: {
                  some: { userId: session.user.id }
                }
              }
            }
          ]
        }
      },
      include: {
        task: {
          select: { id: true, title: true }
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        creator: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      },
      orderBy: { position: 'asc' }
    })

    // Cache the results for 5 minutes
    cache.set(cacheKey, subtasks, 300)

    return NextResponse.json({ subtasks })

  } catch (error) {
    console.error('Error fetching subtasks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}