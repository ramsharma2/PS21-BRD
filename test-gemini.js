const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: 'backend/.env' });

async function test(modelName) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: "You are an expert Business Analyst." });
    try {
        const result = await model.generateContent('Say exactly: Hello World');
        console.log(`Success for ${modelName}:`, result.response.text());
    } catch (e) {
        console.error(`Error for ${modelName}:`, e);
    }
}

test('gemini-2.5-flash');
