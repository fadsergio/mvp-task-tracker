import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating user tenant...');

    // Получаем последнего зарегистрированного пользователя
    const latestUser = await prisma.user.findFirst({
        orderBy: { createdAt: 'desc' }
    });

    if (!latestUser) {
        console.log('No users found');
        return;
    }

    console.log(`Found user: ${latestUser.email}`);
    console.log(`Current tenantId: ${latestUser.tenantId}`);

    // Обновляем tenantId на demo-tenant
    await prisma.user.update({
        where: { id: latestUser.id },
        data: { tenantId: 'demo-tenant' }
    });

    console.log('✅ Updated tenantId to: demo-tenant');
    console.log('\nNow you can login with:');
    console.log(`Email: ${latestUser.email}`);
    console.log('Password: your password');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
