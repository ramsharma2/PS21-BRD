import { PrismaClient } from '@prisma/client';
import { extractionService } from './src/services/extractionService';

const prisma = new PrismaClient();

async function testExtraction() {
    try {
        // Find a project with chunks but no extractions
        const project = await prisma.project.findFirst({
            where: {
                chunks: {
                    some: {
                        isRelevant: true
                    }
                },
                extractions: {
                    none: {}
                }
            },
            include: {
                chunks: {
                    where: { isRelevant: true },
                    take: 5
                }
            }
        });

        if (!project) {
            console.log('No suitable project found');
            return;
        }

        console.log(`\nTesting extraction on project: ${project.name} (${project.id})`);
        console.log(`Chunks: ${project.chunks.length}`);

        // Run extraction
        console.log('\nRunning extraction...');
        await extractionService.extractFromProject(project.id);

        // Check results
        const extractions = await prisma.extraction.findMany({
            where: { projectId: project.id }
        });

        console.log(`\n✓ Extraction complete!`);
        console.log(`  Extractions created: ${extractions.length}`);

        if (extractions.length > 0) {
            console.log('\n  Sample extractions:');
            extractions.slice(0, 3).forEach((e, i) => {
                console.log(`    ${i + 1}. [${e.category}] ${e.content.substring(0, 80)}...`);
            });
        }

    } catch (error) {
        console.error('\n❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testExtraction();
