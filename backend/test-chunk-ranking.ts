import { PrismaClient } from '@prisma/client';
import { chunkRankingService } from './src/services/chunkRankingService';

const prisma = new PrismaClient();

async function testChunkRanking() {
    try {
        // Find a project with chunks
        const project = await prisma.project.findFirst({
            include: {
                chunks: {
                    where: { isRelevant: true },
                    take: 5,
                },
            },
        });

        if (!project) {
            console.log('No project found');
            return;
        }

        console.log(`\n📊 Testing Chunk Ranking for Project: ${project.name}`);
        console.log(`Project ID: ${project.id}\n`);

        // 1. Get ranking statistics
        console.log('1️⃣  Getting ranking statistics...');
        const stats = await chunkRankingService.getRankingStats(project.id);
        console.log(`   Total chunks: ${stats.totalChunks}`);
        console.log(`   Relevant chunks: ${stats.relevantChunks}`);
        console.log(`   Average score: ${stats.averageScore.toFixed(3)}`);
        console.log(`   Score distribution:`);
        stats.scoreDistribution.forEach(dist => {
            console.log(`     ${dist.range}: ${dist.count} chunks`);
        });

        // 2. Re-rank chunks with default settings
        console.log('\n2️⃣  Re-ranking chunks (top 10)...');
        const rankedChunks = await chunkRankingService.reRankChunks(project.id, {
            topN: 10,
            relevanceWeight: 0.5,
            semanticWeight: 0.3,
            diversityWeight: 0.2,
        });

        console.log(`   Selected ${rankedChunks.length} chunks\n`);
        rankedChunks.slice(0, 5).forEach(chunk => {
            console.log(`   Rank ${chunk.rank}:`);
            console.log(`     Final Score: ${chunk.finalScore.toFixed(3)}`);
            console.log(`     Relevance: ${chunk.relevanceScore.toFixed(3)}`);
            console.log(`     Semantic: ${chunk.semanticScore.toFixed(3)}`);
            console.log(`     Diversity: ${chunk.diversityScore.toFixed(3)}`);
            console.log(`     Content: ${chunk.content.substring(0, 100)}...`);
            console.log('');
        });

        // 3. Get ranked chunks for functional requirements
        console.log('3️⃣  Getting ranked chunks for functional requirements...');
        const functionalChunks = await chunkRankingService.getRankedChunksForCategory(
            project.id,
            'functional_req',
            5
        );

        console.log(`   Found ${functionalChunks.length} chunks for functional requirements\n`);
        functionalChunks.slice(0, 3).forEach(chunk => {
            console.log(`   Rank ${chunk.rank}: Score ${chunk.finalScore.toFixed(3)}`);
            console.log(`     ${chunk.content.substring(0, 100)}...`);
            console.log('');
        });

        // 4. Test batch re-ranking
        console.log('4️⃣  Testing batch re-ranking (updating database)...');
        await chunkRankingService.batchReRankAndUpdate(project.id, 20);
        console.log('   ✅ Batch re-ranking completed\n');

        console.log('✅ All tests completed successfully!');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

testChunkRanking();
