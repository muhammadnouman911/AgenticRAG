import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set. AI features will not work.');
}

const genAI = new GoogleGenerativeAI(apiKey || 'dummy_key');

export const getModel = (modelName: string = 'gemini-2.5-flash') => {
  return genAI.getGenerativeModel({ model: modelName });
};

export async function generateContent(prompt: string, systemInstruction?: string) {
  const model = getModel();
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    systemInstruction: systemInstruction ? { role: 'system', parts: [{ text: systemInstruction }] } : undefined,
  });
  return result.response.text();
}

export async function generateJSON<T>(prompt: string, systemInstruction?: string): Promise<T> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    systemInstruction: systemInstruction ? { role: 'system', parts: [{ text: systemInstruction }] } : undefined,
  });
  const text = result.response.text();
  console.log('AI Response:', text);
  try {
    // Strip markdown code blocks if present
    const cleanText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(cleanText) as T;
  } catch (e) {
    console.error('Failed to parse AI JSON response:', text);
    // Fallback for simple answer if it's not JSON
    if (typeof text === 'string' && text.length > 0) {
       return { answer: text, confidence: 0.5 } as any;
    }
    throw new Error('Invalid AI response format');
  }
}
