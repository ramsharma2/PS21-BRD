const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const updated = await prisma.project.updateMany({
        where: { status: 'processing' },
        data: { status: 'draft' },
    });
    console.log(`Reset ${updated.count} projects from processing to draft.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
