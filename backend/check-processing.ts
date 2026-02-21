import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProcessing() {
    try {
        // Get all projects with their sources and extractions
        const projects = await prisma.project.findMany({
            include: {
                sources: true,
                extractions: true,
                chunks: true,
            }
        });

        console.log('\n=== Project Processing Status ===\n');

        for (const project of projects) {
            console.log(`Project: ${project.name} (${project.id})`);
            console.log(`  Status: ${project.status}`);
            console.log(`  Sources: ${project.sources.length}`);
            console.log(`  Chunks: ${project.chunks.length}`);
            console.log(`  Extractions: ${project.extractions.length}`);
            
            if (project.sources.length > 0) {
                console.log(`\n  Source details:`);
                project.sources.forEach((source, i) => {
                    console.log(`    ${i + 1}. Type: ${source.sourceType}, Content length: ${source.rawContent.length} chars`);
                });
            }

            if (project.chunks.length > 0) {
                console.log(`\n  Chunk details:`);
                const relevantChunks = project.chunks.filter(c => c.isRelevant);
                const noiseChunks = project.chunks.filter(c => !c.isRelevant);
                console.log(`    Relevant: ${relevantChunks.length}`);
                console.log(`    Noise: ${noiseChunks.length}`);
            }

            console.log('\n---\n');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkProcessing();
