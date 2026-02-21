import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyDd17UesuOvcxQ2rvix2HTtNAJ9Of4XvkA';

async function testApiKey() {
    console.log('Testing Gemini API Key with recommended models...\n');

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);

        // Test 1: Text generation with gemini-2.5-flash
        console.log('Test 1: Text Generation (gemini-2.5-flash)');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent('Say hello in one word');
        const response = result.response.text();
        console.log('✓ Text generation works:', response);
        console.log();

        // Test 2: Embedding generation
        console.log('Test 2: Embedding Generation (gemini-embedding-001)');
        const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
        const embeddingResult = await embeddingModel.embedContent('test text');
        console.log('✓ Embedding generation works, dimension:', embeddingResult.embedding.values.length);
        console.log();

        // Test 3: JSON response
        console.log('Test 3: Structured JSON Response');
        const jsonPrompt = `Extract requirements from this text and respond with JSON:
"The system must support user login and password reset."

Respond with:
{
  "requirements": ["string"]
}`;
        const jsonResult = await model.generateContent(jsonPrompt);
        const jsonResponse = jsonResult.response.text();
        console.log('✓ JSON response:', jsonResponse.substring(0, 200));
        console.log();

        console.log('✅ All tests passed! API key is working perfectly.');
        console.log('\nRecommended configuration:');
        console.log('GEMINI_MODEL=gemini-2.5-flash');
        console.log('GOOGLE_EMBEDDING_MODEL=gemini-embedding-001');
        return true;
    } catch (error: any) {
        console.error('❌ API key test failed:');
        console.error('Error:', error.message);
        if (error.status) {
            console.error('Status:', error.status);
        }
        return false;
    }
}

testApiKey().then((success) => {
    process.exit(success ? 0 : 1);
});
