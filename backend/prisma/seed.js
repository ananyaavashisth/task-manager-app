require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Deleting existing data...');
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating users...');
  const saltRounds = 10;
  
  const alexPassword = await bcrypt.hash('Alex@123', saltRounds);
  const alex = await prisma.user.create({
    data: {
      name: 'Alex Morgan',
      email: 'alex@taskflow.com',
      password: alexPassword,
      role: 'ADMIN',
    },
  });

  const sarahPassword = await bcrypt.hash('Sarah@123', saltRounds);
  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah Chen',
      email: 'sarah@taskflow.com',
      password: sarahPassword,
      role: 'MEMBER',
    },
  });

  const rajPassword = await bcrypt.hash('Raj@123', saltRounds);
  const raj = await prisma.user.create({
    data: {
      name: 'Raj Patel',
      email: 'raj@taskflow.com',
      password: rajPassword,
      role: 'MEMBER',
    },
  });

  console.log('Creating projects and members...');
  
  const project1 = await prisma.project.create({
    data: {
      name: 'Mobile App Redesign',
      description: 'Redesigning the mobile experience for Q2 launch',
      members: {
        create: [
          { userId: alex.id, role: 'ADMIN' },
          { userId: sarah.id, role: 'MEMBER' },
          { userId: raj.id, role: 'MEMBER' },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Backend Infrastructure',
      description: 'Upgrading server architecture and API performance',
      members: {
        create: [
          { userId: alex.id, role: 'ADMIN' },
          { userId: sarah.id, role: 'MEMBER' },
          { userId: raj.id, role: 'MEMBER' },
        ],
      },
    },
  });

  console.log('Creating tasks...');

  await prisma.task.createMany({
    data: [
      // Project 1 Tasks
      {
        title: 'Design new onboarding flow',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date('2026-05-10T00:00:00Z'),
        projectId: project1.id,
        assigneeId: sarah.id,
        creatorId: alex.id,
      },
      {
        title: 'Update color system',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date('2026-05-15T00:00:00Z'),
        projectId: project1.id,
        assigneeId: raj.id,
        creatorId: alex.id,
      },
      {
        title: 'Fix login screen bug',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: new Date('2026-05-05T00:00:00Z'),
        projectId: project1.id,
        assigneeId: sarah.id,
        creatorId: alex.id,
      },
      {
        title: 'Write UI documentation',
        status: 'TODO',
        priority: 'LOW',
        dueDate: new Date('2026-05-20T00:00:00Z'),
        projectId: project1.id,
        assigneeId: raj.id,
        creatorId: alex.id,
      },
      // Project 2 Tasks
      {
        title: 'Migrate to PostgreSQL v15',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: new Date('2026-05-03T00:00:00Z'),
        projectId: project2.id,
        assigneeId: raj.id,
        creatorId: alex.id,
      },
      {
        title: 'Set up Redis caching',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date('2026-05-12T00:00:00Z'),
        projectId: project2.id,
        assigneeId: sarah.id,
        creatorId: alex.id,
      },
      {
        title: 'API rate limiting',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date('2026-05-18T00:00:00Z'),
        projectId: project2.id,
        assigneeId: raj.id,
        creatorId: alex.id,
      },
    ],
  });

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
