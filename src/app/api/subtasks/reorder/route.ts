import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reorderSubtasksSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  subtasks: z.array(z.object({
    id: z.string(),
    position: z.number()
  }))
})

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = reorderSubtasksSchema.parse(body)

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

    // Update positions in a transaction
    await prisma.$transaction(
      validatedData.subtasks.map(subtask =>
        prisma.subtask.update({
          where: { id: subtask.id },
          data: { position: subtask.position }
        })
      )
    )

    return NextResponse.json({
      message: 'Subtasks reordered successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error reordering subtasks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}