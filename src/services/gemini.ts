import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Discipline {
  id: string;
  title: string;
  description: string;
  hasChildren: boolean;
}

export interface BibliographyItem {
  id: string;
  title: string;
  author: string;
  type: string;
  year: string;
  description: string;
}

export interface EducationalContent {
  introduction: string;
  keyPillars: { title: string; explanation: string }[];
  realWorldImpact: string;
  funFact: string;
}

// Simple session cache to minimize redundant API calls
const taxonomyCache: Record<string, Discipline[]> = {};
const bibliographyCache: Record<string, BibliographyItem[]> = {};
const educationCache: Record<string, EducationalContent> = {};

export async function getSubDisciplines(parent: string): Promise<Discipline[]> {
  if (taxonomyCache[parent]) return taxonomyCache[parent];

  const contents = parent === 'ROOT' 
    ? "List the absolute top-level, fundamental branches encompassing ALL human knowledge and academia. Provide a fully exhaustive list of domains (e.g., Natural Sciences, Formal Sciences, Social Sciences, Humanities, Arts, Applied Sciences, Philosophy, Law, Medicine, Business, Education, Theology etc.). Aim for a comprehensive list of distinct top-level domains. Return them as a JSON list."
    : `List the immediate, widely recognized academic, professional, or artistic sub-disciplines of "${parent}". Extract a comprehensive and exhaustive list of direct child fields. Aim for a thorough breakdown. Only list the direct children, do not go deeper than one level. If "${parent}" is highly specific and has no meaningful sub-disciplines, return an empty array or set hasChildren to false. Returns JSON.`;

  // Switching to Flash Lite model for the fastest possible response times
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents,
    config: {
      temperature: 0.15,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "A unique slug/id without spaces" },
            title: { type: Type.STRING },
            description: { type: Type.STRING, description: "A one sentence description" },
            hasChildren: { type: Type.BOOLEAN, description: "True if this field has further widely recognized sub-disciplines" }
          },
          required: ["id", "title", "description", "hasChildren"]
        }
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '[]');
    taxonomyCache[parent] = data;
    return data;
  } catch (e) {
    console.error("Failed to parse sub-disciplines:", e);
    return [];
  }
}

export async function getBibliography(discipline: string): Promise<BibliographyItem[]> {
  if (bibliographyCache[discipline]) return bibliographyCache[discipline];

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: `Generate a curated, highly-regarded bibliography for the field of "${discipline}". Include classic textbooks, foundational research papers, key review articles, or seminal historical works that a serious student or researcher must know. Focus on authoritative sources. Returns JSON.`,
    config: {
      temperature: 0.3, 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            type: { type: Type.STRING, description: "e.g., 'Textbook', 'Foundational Paper', 'Review'" },
            year: { type: Type.STRING },
            description: { type: Type.STRING, description: "Why is this significant in this field?" }
          },
          required: ["id", "title", "author", "type", "year", "description"]
        }
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '[]');
    bibliographyCache[discipline] = data;
    return data;
  } catch (e) {
    console.error("Failed to parse bibliography:", e);
    return [];
  }
}

export async function getEducationalContent(discipline: string): Promise<EducationalContent | null> {
  if (educationCache[discipline]) return educationCache[discipline];

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: `Generate a "School Level" educational guide for the academic field of "${discipline}". 
    The tone should be engaging and accessible for a high school or undergraduate student. 
    Explain what it is, why it exists, and how it works.
    Return JSON.`,
    config: {
      temperature: 0.3, 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          introduction: { type: Type.STRING, description: "A simple, engaging introduction to the field" },
          keyPillars: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: {
                title: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["title", "explanation"]
            },
            description: "3-4 core concepts or foundations of the field"
          },
          realWorldImpact: { type: Type.STRING, description: "How this field affects everyday life or industry" },
          funFact: { type: Type.STRING, description: "An interesting or surprising fact about this field" }
        },
        required: ["introduction", "keyPillars", "realWorldImpact", "funFact"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || 'null');
    if (data) educationCache[discipline] = data;
    return data;
  } catch (e) {
    console.error("Failed to parse educational content:", e);
    return null;
  }
}
