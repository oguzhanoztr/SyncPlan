import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSubtaskSchema = z.object({
  title: z.string().min(1, "Subtask title is required"),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
  dueDate: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const taskId = params.id
    const body = await request.json()
    const validatedData = createSubtaskSchema.parse(body)

    // Check if parent task exists and user has access
    const parentTask = await prisma.task.findFirst({
      where: {
        id: taskId,
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
      },
      include: {
        project: true
      }
    })

    if (!parentTask) {
      return NextResponse.json(
        { error: 'Parent task not found or access denied' },
        { status: 404 }
      )
    }

    // Create subtask
    const subtask = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        projectId: parentTask.projectId,
        assigneeId: validatedData.assigneeId,
        priority: validatedData.priority,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        creatorId: session.user.id,
        parentTaskId: taskId,
      },
      include: {
        project: {
          select: { id: true, name: true }
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        creator: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    })

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const taskId = params.id

    // Check if parent task exists and user has access
    const parentTask = await prisma.task.findFirst({
      where: {
        id: taskId,
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

    // Get subtasks
    const subtasks = await prisma.task.findMany({
      where: {
        parentTaskId: taskId
      },
      include: {
        project: {
          select: { id: true, name: true }
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        creator: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ subtasks })

  } catch (error) {
    console.error('Error fetching subtasks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}