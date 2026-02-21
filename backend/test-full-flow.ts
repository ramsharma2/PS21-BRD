import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateEmbedding } from './src/utils/embeddings';

const API_KEY = 'AIzaSyDd17UesuOvcxQ2rvix2HTtNAJ9Of4XvkA';

async function testFullFlow() {
    console.log('Testing Full BRDify Flow with Real API...\n');

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);

        // Test 1: Noise Classification
        console.log('Test 1: Noise Classification');
        const noiseModel = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: 'You are a noise filter. Classify text as RELEVANT or NOISE for business requirements.'
        });
        
        const noisePrompt = `Classify this text as RELEVANT or NOISE:
"The system must support user authentication with email and password."

Respond with JSON:
{
  "classification": "RELEVANT" | "NOISE",
  "confidence": 0.0-1.0,
  "reasoning": "string"
}`;
        
        const noiseResult = await noiseModel.generateContent(noisePrompt);
        console.log('✓ Noise classification:', noiseResult.response.text().substring(0, 150));
        console.log();

        // Test 2: Information Extraction
        console.log('Test 2: Information Extraction');
        const extractionModel = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: 'Extract structured business requirements from text.'
        });
        
        const extractionPrompt = `Extract requirements from this text:
"The system must support user login. Users should be able to reset their password via email."

Respond with JSON array:
[
  {
    "category": "functional_req",
    "content": "string",
    "priority": "must_have",
    "quote": "string",
    "confidence": 0.9
  }
]`;
        
        const extractionResult = await extractionModel.generateContent(extractionPrompt);
        console.log('✓ Extraction:', extractionResult.response.text().substring(0, 200));
        console.log();

        // Test 3: BRD Generation
        console.log('Test 3: BRD Executive Summary Generation');
        const brdModel = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: 'Generate professional Business Requirements Documents.'
        });
        
        const brdPrompt = `Create an executive summary based on these requirements:
- User authentication system
- Password reset functionality
- Email notifications

Respond with JSON:
{
  "overview": "string",
  "scope": "string",
  "objectives": ["string"],
  "stakeholders": ["string"],
  "timeline": "string"
}`;
        
        const brdResult = await brdModel.generateContent(brdPrompt);
        console.log('✓ BRD Generation:', brdResult.response.text().substring(0, 200));
        console.log();

        // Test 4: Embedding Generation
        console.log('Test 4: Embedding Generation');
        const embedding = await generateEmbedding('Test requirement for embedding');
        console.log('✓ Embedding dimension:', embedding.length);
        console.log();

        console.log('✅ All flow tests passed! The system is ready to use with real API.');
        return true;
    } catch (error: any) {
        console.error('❌ Flow test failed:');
        console.error('Error:', error.message);
        if (error.status) {
            console.error('Status:', error.status);
        }
        return false;
    }
}

testFullFlow().then((success) => {
    process.exit(success ? 0 : 1);
});
