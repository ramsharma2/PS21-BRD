import * as dotenv from 'dotenv';
dotenv.config();
import { extractionService } from './src/services/extractionService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
    try {
        const projectId = 'cmlwajlq100008arl00t4szin';
        console.log(`Testing extraction for project: ${projectId}`);

        // Count chunks before
        const chunkCount = await prisma.chunk.count({ where: { projectId, isRelevant: true } });
        console.log(`Relevant chunks found: ${chunkCount}`);

        await extractionService.extractFromProject(projectId);

        // Count extractions after
        const extractCount = await prisma.extraction.count({ where: { projectId } });
        console.log(`Extractions completed: ${extractCount}`);
    } catch (e) {
        console.error('Test script error:', e);
    } finally {
        await prisma.$disconnect();
    }
}
test();
