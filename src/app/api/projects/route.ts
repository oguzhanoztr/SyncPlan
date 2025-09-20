import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cache, generateCacheKey, invalidateCache } from '@/lib/cache'
import { z } from 'zod'

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check cache first
    const cacheKey = generateCacheKey.projects(session.user.id)
    const cachedProjects = cache.get(cacheKey)

    if (cachedProjects) {
      return NextResponse.json({ projects: cachedProjects })
    }

    // Use optimized Prisma query
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          {
            members: {
              some: { userId: session.user.id }
            }
          }
        ]
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          }
        },
        _count: {
          select: {
            tasks: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Cache the results for 5 minutes
    cache.set(cacheKey, projects, 300)

    return NextResponse.json({ projects })

  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const validatedData = createProjectSchema.parse(body)

    const project = await prisma.project.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        ownerId: session.user.id,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          }
        },
        _count: {
          select: {
            tasks: true
          }
        }
      }
    })

    // Invalidate projects cache
    invalidateCache.project(project.id)

    return NextResponse.json({
      message: 'Project created successfully',
      project
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}