import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const clientNames = [
    'ООО "Технологии Будущего"',
    'ИП Смирнов А.В.',
    'АО "Цифровые Решения"',
    'ООО "Инновационные Системы"',
    'GlobalTech Solutions',
    'Digital Innovations Ltd',
    'ООО "Веб-Студия Прогресс"',
    'ЗАО "Консалтинг Плюс"',
    'Smart Business Group',
    'ООО "Маркетинг Эксперт"',
    'TechStart Ventures',
    'ООО "Логистика Сервис"',
    'Creative Agency Pro',
    'ООО "Финансовый Консультант"',
    'E-Commerce Masters',
];

const domains = ['tech', 'digital', 'web', 'biz', 'pro', 'group', 'solutions', 'consulting'];

function generateEmail(companyName: string): string {
    const cleanName = companyName
        .replace(/[^a-zA-Zа-яА-Я0-9]/g, '')
        .toLowerCase()
        .substring(0, 10);
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `info@${cleanName}.${domain}`;
}

function generatePhone(): string {
    const code = Math.floor(Math.random() * 900) + 100;
    const num1 = Math.floor(Math.random() * 900) + 100;
    const num2 = Math.floor(Math.random() * 90) + 10;
    const num3 = Math.floor(Math.random() * 90) + 10;
    return `+7 (${code}) ${num1}-${num2}-${num3}`;
}

async function seedClients() {
    console.log('🌱 Seeding clients...');

    // Use same tenantId as main seed
    const tenantId = 'demo-tenant';

    for (const name of clientNames) {
        // Random created date within last 180 days
        const daysAgo = Math.floor(Math.random() * 180);
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);

        const client = await prisma.client.create({
            data: {
                name,
                tenantId,
                contact: {
                    email: generateEmail(name),
                    phone: generatePhone(),
                },
                createdAt,
                updatedAt: createdAt,
            },
        });

        console.log(`✅ Created client: ${client.name}`);
    }

    console.log('✨ Clients seeded successfully!');
}

seedClients()
    .catch((e) => {
        console.error('❌ Error seeding clients:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
