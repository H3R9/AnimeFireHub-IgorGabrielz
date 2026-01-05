import { GoogleGenAI, Type } from "@google/genai";
import { Anime } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using 'gemini-3-flash-preview' for fast structured data generation
const MODEL_NAME = "gemini-3-flash-preview";

export const fetchSimulatedCatalog = async (category: string): Promise<Anime[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `List 8 popular animes currently trending in Brazil that would be found on AnimeFire.io under the category "${category}". 
      Return strictly a JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              thumbnail: { type: Type.STRING, description: "Use https://picsum.photos/300/450 if real url unavailable" },
              genres: { type: Type.ARRAY, items: { type: Type.STRING } },
              rating: { type: Type.STRING },
              year: { type: Type.STRING }
            },
            required: ["id", "title", "description", "thumbnail", "genres", "year"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Anime[];
    }
    return [];
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};

export const fetchAnimeDetailsWithStreams = async (animeTitle: string) => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate simulated stream metadata for the anime "${animeTitle}". 
      Imagine this is data scraped from AnimeFire.
      Return JSON with a detailed description and a list of fake stream objects (episodes).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            streams: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  url: { type: Type.STRING },
                  quality: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Gemini Details Error:", error);
    return null;
  }
};
