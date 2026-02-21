import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetStuckProjects() {
    console.log('Resetting stuck projects...');

    // Find all projects stuck in processing or ingesting
    const stuckProjects = await prisma.project.findMany({
        where: {
            OR: [
                { status: 'processing' },
                { status: 'ingesting' }
            ]
        }
    });

    console.log(`Found ${stuckProjects.length} stuck projects`);

    // Reset them to draft status
    for (const project of stuckProjects) {
        await prisma.project.update({
            where: { id: project.id },
            data: { status: 'draft' }
        });
        console.log(`✓ Reset project: ${project.name} (${project.id})`);
    }

    console.log('Done!');
    await prisma.$disconnect();
}

resetStuckProjects().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
