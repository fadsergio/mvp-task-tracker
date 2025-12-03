import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'serhio@example.com';
    const passwordRaw = 'password123';
    const targetTenantId = 'demo-tenant';

    console.log(`Promoting ${email} to SUPERADMIN in tenant ${targetTenantId}...`);

    const password = await bcrypt.hash(passwordRaw, 10);

    // Upsert user: create if not exists, update if exists
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role: 'ADMIN',
            tenantId: targetTenantId,
            // Update password if you want to ensure it matches, otherwise comment out
            password: password,
        },
        create: {
            email,
            name: 'Serhio Superadmin',
            password,
            tenantId: targetTenantId,
            role: 'ADMIN',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        },
    });

    console.log('✅ Operation successful!');
    console.log(`User: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Tenant: ${user.tenantId}`);
    console.log(`Password: ${passwordRaw}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
