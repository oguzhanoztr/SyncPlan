import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@syncplan.dev' },
    update: {},
    create: {
      email: 'demo@syncplan.dev',
      name: 'Demo User',
      role: 'USER',
    },
  })

  console.log('👤 Created user:', user.email)

  // Create demo project
  const project = await prisma.project.upsert({
    where: { id: 'demo-project' },
    update: {},
    create: {
      id: 'demo-project',
      name: 'SyncPlan Demo Project',
      description: 'A demonstration project showing SyncPlan features',
      ownerId: user.id,
      visibility: 'PUBLIC',
      color: '#3b82f6',
      status: 'ACTIVE',
    },
  })

  console.log('📁 Created project:', project.name)

  // Add user as project member
  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: project.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      projectId: project.id,
      userId: user.id,
      role: 'OWNER',
    },
  })

  // Create demo tasks
  const tasks = [
    {
      id: 'task-1',
      title: 'Set up project structure',
      description: 'Initialize the project with proper folder structure and dependencies',
      status: 'DONE',
      priority: 'HIGH',
      tags: ['setup', 'infrastructure'],
    },
    {
      id: 'task-2',
      title: 'Design user authentication',
      description: 'Create wireframes and flow for user login and registration',
      status: 'DONE',
      priority: 'MEDIUM',
      tags: ['design', 'auth'],
    },
    {
      id: 'task-3',
      title: 'Implement task management',
      description: 'Build CRUD operations for tasks with drag and drop functionality',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      tags: ['frontend', 'tasks'],
    },
    {
      id: 'task-4',
      title: 'Add real-time collaboration',
      description: 'Implement WebSocket for real-time updates and collaboration',
      status: 'TODO',
      priority: 'MEDIUM',
      tags: ['backend', 'realtime'],
    },
  ]

  for (const taskData of tasks) {
    const task = await prisma.task.upsert({
      where: { id: taskData.id },
      update: {},
      create: {
        id: taskData.id,
        title: taskData.title,
        description: taskData.description,
        projectId: project.id,
        creatorId: user.id,
        assigneeId: user.id,
        status: taskData.status as any,
        priority: taskData.priority as any,
        tags: taskData.tags,
        dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within 30 days
        estimatedHours: Math.floor(Math.random() * 16) + 2, // 2-18 hours
      },
    })

    console.log('📝 Created task:', task.title)
  }

  // Create a demo sprint
  const sprint = await prisma.plan.upsert({
    where: { id: 'demo-sprint' },
    update: {},
    create: {
      id: 'demo-sprint',
      name: 'Sprint 1 - Core Features',
      projectId: project.id,
      type: 'SPRINT',
      status: 'ACTIVE',
      goals: 'Implement core task management features and basic authentication',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    },
  })

  console.log('🏃 Created sprint:', sprint.name)

  // Add tasks to sprint
  for (const taskData of tasks.slice(0, 3)) {
    await prisma.planTask.upsert({
      where: {
        planId_taskId: {
          planId: sprint.id,
          taskId: taskData.id,
        },
      },
      update: {},
      create: {
        planId: sprint.id,
        taskId: taskData.id,
      },
    })
  }

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })