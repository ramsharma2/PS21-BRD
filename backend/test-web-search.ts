import dotenv from 'dotenv';
import { webSearchService } from './src/services/webSearchService';

// Load environment variables
dotenv.config();

async function testWebSearch() {
    console.log('='.repeat(60));
    console.log('Testing Web Search Service');
    console.log('='.repeat(60));
    console.log();

    // Test 1: General search
    console.log('Test 1: General Web Search');
    console.log('-'.repeat(60));
    try {
        const results = await webSearchService.search('React best practices 2024', 3);
        console.log(`✓ Found ${results.length} results`);
        results.forEach((result, index) => {
            console.log(`\n${index + 1}. ${result.title}`);
            console.log(`   Snippet: ${result.snippet.substring(0, 100)}...`);
            console.log(`   URL: ${result.url}`);
            console.log(`   Relevance: ${result.relevance}`);
        });
    } catch (error: any) {
        console.error('✗ Error:', error.message);
    }
    console.log();

    // Test 2: Best practices search
    console.log('Test 2: Best Practices Search');
    console.log('-'.repeat(60));
    try {
        const results = await webSearchService.searchBestPractices('healthcare');
        console.log(`✓ Found ${results.length} results`);
        results.forEach((result, index) => {
            console.log(`\n${index + 1}. ${result.title}`);
            console.log(`   Snippet: ${result.snippet.substring(0, 100)}...`);
        });
    } catch (error: any) {
        console.error('✗ Error:', error.message);
    }
    console.log();

    // Test 3: Technical specs search
    console.log('Test 3: Technical Specs Search');
    console.log('-'.repeat(60));
    try {
        const results = await webSearchService.searchTechnicalSpecs('Node.js');
        console.log(`✓ Found ${results.length} results`);
        results.forEach((result, index) => {
            console.log(`\n${index + 1}. ${result.title}`);
            console.log(`   Snippet: ${result.snippet.substring(0, 100)}...`);
        });
    } catch (error: any) {
        console.error('✗ Error:', error.message);
    }
    console.log();

    // Test 4: Compliance search
    console.log('Test 4: Compliance Search');
    console.log('-'.repeat(60));
    try {
        const results = await webSearchService.searchCompliance('GDPR');
        console.log(`✓ Found ${results.length} results`);
        results.forEach((result, index) => {
            console.log(`\n${index + 1}. ${result.title}`);
            console.log(`   Snippet: ${result.snippet.substring(0, 100)}...`);
        });
    } catch (error: any) {
        console.error('✗ Error:', error.message);
    }
    console.log();

    console.log('='.repeat(60));
    console.log('Tests Complete');
    console.log('='.repeat(60));
}

testWebSearch().catch(console.error);
