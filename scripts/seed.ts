import { PrismaClient, Role, TaskStatus, Priority, TimeType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Tenant (Company)
  // In this MVP, tenantId is just a string. We'll use a fixed UUID for simplicity.
  const tenantId = '11111111-1111-1111-1111-111111111111';
  console.log(`Using Tenant ID: ${tenantId}`);

  // 2. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: passwordHash,
      role: Role.ADMIN,
      tenantId,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      name: 'Manager User',
      password: passwordHash,
      role: Role.MANAGER,
      tenantId,
    },
  });

  const executor1 = await prisma.user.upsert({
    where: { email: 'executor1@example.com' },
    update: {},
    create: {
      email: 'executor1@example.com',
      name: 'Executor One',
      password: passwordHash,
      role: Role.EXECUTOR,
      tenantId,
    },
  });

  const executor2 = await prisma.user.upsert({
    where: { email: 'executor2@example.com' },
    update: {},
    create: {
      email: 'executor2@example.com',
      name: 'Executor Two',
      password: passwordHash,
      role: Role.EXECUTOR,
      tenantId,
    },
  });

  console.log('Users created');

  // 3. Create Clients
  const client1 = await prisma.client.create({
    data: {
      name: 'Client Alpha',
      tenantId,
      contact: { email: 'contact@alpha.com', phone: '+1234567890' },
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Client Beta',
      tenantId,
      contact: { email: 'contact@beta.com' },
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'Client Gamma',
      tenantId,
    },
  });

  console.log('Clients created');

  // 4. Create Tasks
  const tasksData = [
    { title: 'Design Homepage', status: TaskStatus.IN_PROGRESS, priority: Priority.HIGH, assignee: executor1 },
    { title: 'Fix Login Bug', status: TaskStatus.NEW, priority: Priority.HIGH, assignee: executor1 },
    { title: 'Write Documentation', status: TaskStatus.DONE, priority: Priority.MEDIUM, assignee: executor2 },
    { title: 'Setup CI/CD', status: TaskStatus.REVIEW, priority: Priority.HIGH, assignee: manager },
    { title: 'Client Meeting', status: TaskStatus.NEW, priority: Priority.MEDIUM, assignee: manager },
    { title: 'Database Backup', status: TaskStatus.PAUSED, priority: Priority.LOW, assignee: executor2 },
    { title: 'Update Dependencies', status: TaskStatus.NEW, priority: Priority.LOW, assignee: executor1 },
    { title: 'Refactor Auth', status: TaskStatus.IN_PROGRESS, priority: Priority.HIGH, assignee: executor2 },
    { title: 'Logo Design', status: TaskStatus.NEW, priority: Priority.MEDIUM, assignee: executor1 },
    { title: 'SEO Optimization', status: TaskStatus.DONE, priority: Priority.LOW, assignee: executor2 },
  ];

  for (const t of tasksData) {
    await prisma.task.create({
      data: {
        title: t.title,
        description: `Description for ${t.title}`,
        status: t.status,
        priority: t.priority,
        tenantId,
        createdById: admin.id,
        clientId: client1.id, // Assign all to client1 for simplicity or randomize
        assignees: {
          connect: { id: t.assignee.id },
        },
        tags: ['mvp', 'v1'],
      },
    });
  }

  console.log('Tasks created');

  // 5. Create Time Entries
  const task = await prisma.task.findFirst({ where: { tenantId } });
  if (task) {
    await prisma.timeEntry.create({
      data: {
        taskId: task.id,
        userId: executor1.id,
        date: new Date(),
        durationHours: 2.5,
        type: TimeType.PAID,
        comment: 'Initial work',
      },
    });
    await prisma.timeEntry.create({
      data: {
        taskId: task.id,
        userId: executor1.id,
        date: new Date(),
        durationHours: 1.0,
        type: TimeType.PAID,
        comment: 'Refinement',
      },
    });
  }

  console.log('Time entries created');
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
