import { GoogleGenAI, Type } from "@google/genai";
import { Prospect, ResearchResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function findLinkedInProfiles(prospects: Prospect[]): Promise<ResearchResponse> {
  const prompt = `Find the LinkedIn profile URLs for the following people. 
  For each person, use Google Search to find their specific LinkedIn profile (linkedin.com/in/...).
  Validate the match using the provided company and designation.
  If no reliable match is found, return "Not Found".
  
  Prospects:
  ${prospects.map(p => `- ${p.name} at ${p.company} (${p.designation})`).join('\n')}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are a professional B2B sales intelligence researcher. Your goal is to find accurate LinkedIn profile URLs for individuals based on their name, company, and designation. Use Google Search grounding to verify your findings. Return only the structured JSON data.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          results: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                company: { type: Type.STRING },
                designation: { type: Type.STRING },
                linkedinUrl: { type: Type.STRING, description: "The LinkedIn profile URL or 'Not Found'" },
              },
              required: ["name", "company", "designation", "linkedinUrl"],
            },
          },
        },
        required: ["results"],
      },
      tools: [{ googleSearch: {} }],
    },
  });

  try {
    return JSON.parse(response.text || '{"results": []}');
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    return { results: [] };
  }
}
