import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSubtaskSchema = z.object({
  title: z.string().min(1, "Subtask title is required").optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; subtaskId: string } }
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
    const validatedData = updateSubtaskSchema.parse(body)

    // Check if subtask exists and user has access
    const subtask = await prisma.task.findFirst({
      where: {
        id: params.subtaskId,
        parentTaskId: params.id,
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

    if (!subtask) {
      return NextResponse.json(
        { error: 'Subtask not found or access denied' },
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

    if (validatedData.dueDate !== undefined) {
      updateData.dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : null
    }

    const updatedSubtask = await prisma.task.update({
      where: { id: params.subtaskId },
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
        }
      }
    })

    return NextResponse.json({
      message: 'Subtask updated successfully',
      subtask: updatedSubtask
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating subtask:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; subtaskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if subtask exists and user has access to delete it
    const subtask = await prisma.task.findFirst({
      where: {
        id: params.subtaskId,
        parentTaskId: params.id,
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

    if (!subtask) {
      return NextResponse.json(
        { error: 'Subtask not found or access denied' },
        { status: 404 }
      )
    }

    // Delete the subtask
    await prisma.task.delete({
      where: { id: params.subtaskId }
    })

    return NextResponse.json({
      message: 'Subtask deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting subtask:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}