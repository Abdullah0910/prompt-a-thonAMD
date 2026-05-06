import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const analyzeNutrition = async (foodDescription: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following food/meal description and return nutrition data in JSON format: "${foodDescription}". 
    Provide estimated calories, protein, carbs, and fats per item.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fat: { type: Type.NUMBER }
              },
              required: ["name", "calories", "protein", "carbs", "fat"]
            }
          },
          totalCalories: { type: Type.NUMBER },
          aiNotes: { type: Type.STRING }
        },
        required: ["items", "totalCalories"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const getHealthRecommendations = async (userData: any, recentLogs: any[]) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on this user profile: ${JSON.stringify(userData.profile)} and recent logs: ${JSON.stringify(recentLogs)}, provide 3 actionable health and nutrition recommendations to help them reach their goals. 
    Goals: ${userData.profile?.dietaryGoals?.join(', ')}.
    Allergies: ${userData.profile?.allergies?.join(', ')}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            suggestion: { type: Type.STRING },
            benefit: { type: Type.STRING },
            category: { type: Type.STRING, enum: ["meal", "habit", "general"] }
          },
          required: ["title", "suggestion", "benefit", "category"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};
