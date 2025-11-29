import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('Users:', users.map(u => ({ id: u.id, name: u.name, email: u.email, tenantId: u.tenantId, role: u.role })));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
