
import { GoogleGenAI, Type } from "@google/genai";
import { POI, SearchResultPlace } from "../types";

/**
 * Search places and return structured data with coordinates using Gemini JSON mode.
 */
export const searchPlacesWithGemini = async (
  query: string, 
  userLat?: number, 
  userLng?: number
): Promise<SearchResultPlace[]> => {
  if (!process.env.API_KEY) {
    console.error("API Key missing");
    return [];
  }

  try {
    // Correct initialization as per Google GenAI guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const contextLocation = userLat && userLng ? `Autour de la position : ${userLat}, ${userLng}.` : "En Guinée (Conakry de préférence).";
    
    const prompt = `
      Trouve des lieux correspondant à la requête : "${query}".
      ${contextLocation}
      Retourne une liste de lieux réels avec leurs coordonnées approximatives (latitude, longitude).
      Pour chaque lieu, fournis le nom, la latitude, la longitude, l'adresse et une courte description.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            places: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  latitude: { type: Type.NUMBER },
                  longitude: { type: Type.NUMBER },
                  address: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    const data = JSON.parse(jsonText);
    return data.places || [];
  } catch (error) {
    console.error("Erreur Gemini Search:", error);
    return [];
  }
};

/**
 * Optimizes a route between multiple POIs using Gemini's reasoning.
 */
export const optimizeRouteWithGemini = async (
  startLocation: { lat: number, lng: number },
  pois: POI[]
): Promise<{ orderedIds: string[]; explanation: string }> => {
  if (!process.env.API_KEY || pois.length === 0) return { orderedIds: pois.map(p => p.id), explanation: "Pas d'optimisation (API Key manquante ou liste vide)." };

  try {
    // Correct initialization as per Google GenAI guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const poiList = pois.map(p => ({
      id: p.id,
      name: p.name,
      lat: p.latitude,
      lng: p.longitude
    }));

    const prompt = `
      Je suis à la position [${startLocation.lat}, ${startLocation.lng}].
      Je dois visiter les lieux suivants : ${JSON.stringify(poiList)}.
      Optimise l'ordre de visite pour minimiser le temps de trajet total (problème du voyageur de commerce).
      Retourne UNIQUEMENT un objet JSON avec deux propriétés :
      1. "orderedIds": un tableau des IDs dans l'ordre de visite optimisé.
      2. "explanation": une courte explication du trajet en français.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            orderedIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            explanation: { type: Type.STRING }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Réponse vide");
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Erreur Optimization:", error);
    return { orderedIds: pois.map(p => p.id), explanation: "Impossible d'optimiser le trajet pour le moment." };
  }
};
