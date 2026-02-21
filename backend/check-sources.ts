import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSources() {
    console.log('Checking sources for all projects...\n');

    const projects = await prisma.project.findMany({
        include: {
            sources: true,
            _count: {
                select: {
                    sources: true,
                    chunks: true,
                    extractions: true
                }
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    for (const project of projects) {
        console.log(`📁 ${project.name} (${project.status})`);
        console.log(`   ID: ${project.id}`);
        console.log(`   Sources: ${project._count.sources}`);
        console.log(`   Chunks: ${project._count.chunks}`);
        console.log(`   Extractions: ${project._count.extractions}`);
        
        if (project.sources.length > 0) {
            console.log(`   Files:`);
            project.sources.forEach((source, idx) => {
                console.log(`     ${idx + 1}. ${source.sourceType} - ${source.rawContent.substring(0, 50)}...`);
            });
        }
        console.log('');
    }

    await prisma.$disconnect();
}

checkSources().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
