const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // Create users
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const memberPassword = await bcrypt.hash('Member@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ethara.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@ethara.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const member1 = await prisma.user.upsert({
    where: { email: 'member1@ethara.com' },
    update: {},
    create: {
      name: 'John Member',
      email: 'member1@ethara.com',
      password: memberPassword,
      role: 'MEMBER',
    },
  });

  const member2 = await prisma.user.upsert({
    where: { email: 'member2@ethara.com' },
    update: {},
    create: {
      name: 'Jane Member',
      email: 'member2@ethara.com',
      password: memberPassword,
      role: 'MEMBER',
    },
  });

  // Create project
  const project = await prisma.project.create({
    data: {
      name: 'Alpha Product Launch',
      description: 'The upcoming MVP launch for the main product line.',
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: member1.id, role: 'MEMBER' },
          { userId: member2.id, role: 'MEMBER' },
        ],
      },
    },
  });

  // Create tasks
  const tasks = [
    {
      title: 'Design landing page',
      description: 'Create high-fidelity mockups for the new landing page.',
      status: 'DONE',
      priority: 'HIGH',
      projectId: project.id,
      assigneeId: member1.id,
      creatorId: admin.id,
      dueDate: new Date(new Date().setDate(new Date().getDate() - 2)),
    },
    {
      title: 'Setup PostgreSQL Database',
      description: 'Provision database on Railway and configure Prisma.',
      status: 'DONE',
      priority: 'HIGH',
      projectId: project.id,
      assigneeId: admin.id,
      creatorId: admin.id,
    },
    {
      title: 'Implement Auth API',
      description: 'Build JWT signup, login, and middleware.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      projectId: project.id,
      assigneeId: member2.id,
      creatorId: admin.id,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    },
    {
      title: 'Create Dashboard UI',
      description: 'Build the React dashboard with stat cards and lists.',
      status: 'TODO',
      priority: 'MEDIUM',
      projectId: project.id,
      assigneeId: member1.id,
      creatorId: admin.id,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    },
    {
      title: 'Write project README',
      description: 'Document architecture, tech stack, and API endpoints.',
      status: 'TODO',
      priority: 'LOW',
      projectId: project.id,
      assigneeId: null,
      creatorId: admin.id,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 10)),
    },
    {
      title: 'Overdue task example',
      description: 'This task is intentionally overdue to test the dashboard feature.',
      status: 'TODO',
      priority: 'MEDIUM',
      projectId: project.id,
      assigneeId: member2.id,
      creatorId: admin.id,
      dueDate: new Date(new Date().setDate(new Date().getDate() - 5)),
    },
  ];

  for (const t of tasks) {
    await prisma.task.create({ data: t });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
