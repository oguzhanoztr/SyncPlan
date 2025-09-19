import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
  estimatedHours: z.number().optional(),
  actualHours: z.number().optional(),
  tags: z.array(z.string()).optional(),
})

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

    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        OR: [
          { creatorId: session.user.id },
          { assigneeId: session.user.id },
          {
            project: {
              OR: [
                { ownerId: session.user.id },
                {
                  members: {
                    some: { userId: session.user.id }
                  }
                }
              ]
            }
          }
        ]
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
        },
        parentTask: {
          select: { id: true, title: true }
        },
        subtasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ task })

  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const body = await request.json()
    const validatedData = updateTaskSchema.parse(body)

    // Check if user has access to the task
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        OR: [
          { creatorId: session.user.id },
          { assigneeId: session.user.id },
          {
            project: {
              OR: [
                { ownerId: session.user.id },
                {
                  members: {
                    some: { userId: session.user.id }
                  }
                }
              ]
            }
          }
        ]
      }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found or access denied' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}

    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.status !== undefined) updateData.status = validatedData.status
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority
    if (validatedData.assigneeId !== undefined) updateData.assigneeId = validatedData.assigneeId
    if (validatedData.estimatedHours !== undefined) updateData.estimatedHours = validatedData.estimatedHours
    if (validatedData.actualHours !== undefined) updateData.actualHours = validatedData.actualHours
    if (validatedData.tags !== undefined) updateData.tags = validatedData.tags

    if (validatedData.dueDate !== undefined) {
      updateData.dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : null
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        project: {
          select: { id: true, name: true }
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        creator: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        parentTask: {
          select: { id: true, title: true }
        },
        subtasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return NextResponse.json({
      message: 'Task updated successfully',
      task: updatedTask
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Check if user has access to delete the task
    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        OR: [
          { creatorId: session.user.id },
          {
            project: {
              ownerId: session.user.id
            }
          }
        ]
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found or access denied' },
        { status: 404 }
      )
    }

    // Delete the task and all its subtasks (cascade delete)
    await prisma.task.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Task deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}