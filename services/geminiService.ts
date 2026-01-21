
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const suggestRules = async (familyType: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `${familyType}向けの円満な夫婦生活のための家事ルールを5つ提案してください。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
          },
          required: ['title', 'description', 'severity']
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const suggestPunishment = async () => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: '夫婦で楽しめる、重すぎず笑える「罰ゲーム」を5つ提案してください。',
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  return JSON.parse(response.text);
};
