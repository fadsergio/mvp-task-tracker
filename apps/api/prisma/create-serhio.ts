import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const tenantId = 'demo-tenant';
    const password = await bcrypt.hash('password123', 10);

    const serhio = await prisma.user.upsert({
        where: { email: 'serhio@example.com' },
        update: {
            role: 'ADMIN',
            tenantId: tenantId, // Ensure he is in the demo tenant
        },
        create: {
            email: 'serhio@example.com',
            name: 'Serhio',
            password,
            tenantId,
            role: 'ADMIN',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Serhio',
        },
    });

    console.log('User Serhio created/updated:', serhio);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
