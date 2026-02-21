import { PrismaClient } from '@prisma/client';
import { brdGeneratorService } from './src/services/brdGeneratorService';

const prisma = new PrismaClient();

async function testBRDGeneration() {
    try {
        // Find a project with extractions
        const projects = await prisma.project.findMany({
            include: {
                _count: {
                    select: { extractions: true }
                }
            }
        });

        console.log('\nProjects found:');
        projects.forEach(p => {
            console.log(`- ${p.name} (${p.id}): ${p._count.extractions} extractions, status: ${p.status}`);
        });

        // Find a project with extractions
        const projectWithExtractions = projects.find(p => p._count.extractions > 0);

        if (!projectWithExtractions) {
            console.log('\n❌ No projects with extractions found. Please process a project first.');
            return;
        }

        console.log(`\n✓ Testing BRD generation for project: ${projectWithExtractions.name}`);
        console.log(`  Project ID: ${projectWithExtractions.id}`);
        console.log(`  Extractions: ${projectWithExtractions._count.extractions}`);

        // Test BRD generation
        const brdId = await brdGeneratorService.generateBRD(projectWithExtractions.id, 'standard');

        console.log(`\n✓ BRD generated successfully!`);
        console.log(`  BRD ID: ${brdId}`);

        // Fetch and display the BRD
        const brd = await brdGeneratorService.getBRD(projectWithExtractions.id);
        console.log(`\n✓ BRD retrieved successfully!`);
        console.log(`  Version: ${brd?.version}`);
        console.log(`  Sections generated: ${Object.keys(brd || {}).filter(k => !['id', 'projectId', 'version', 'createdAt', 'updatedAt', 'project'].includes(k)).length}`);

    } catch (error) {
        console.error('\n❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testBRDGeneration();
