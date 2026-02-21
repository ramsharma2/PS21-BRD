import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-pro' });
  try {
    const result = await model.generateContent('Say exactly: Hello World');
    console.log('Gemini success:', result.response.text());
  } catch(e) {
    console.error('Gemini error:', e);
  }
}
test();
