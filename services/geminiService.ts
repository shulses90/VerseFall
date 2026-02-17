import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { StoryTurn, GeminiResponse, Faction } from '../types';
import { Language } from "../translations";

import { systemInstruction } from "./prompts";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
const IMAGEN_MODEL = import.meta.env.VITE_IMAGEN_MODEL || 'imagen-3.0-generate-001';

if (!API_KEY) {
  console.warn("VITE_GEMINI_API_KEY environment variable not set. The game will not function correctly.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || '' });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    scene: {
      type: Type.STRING,
      description: "A vivid and descriptive paragraph for the current scene in the story. It should be at least 3-4 sentences long.",
    },
    choices: {
      type: Type.ARRAY,
      description: "An array of 3 short, actionable choices for the player. This MUST be an empty array on the final turn.",
      items: { type: Type.STRING },
    },
    ending: {
      type: Type.STRING,
      description: "Set to 'tyrannical', 'stagnation', or 'awakening' ONLY on the final turn of the game when the story concludes. Otherwise, this should be null or omitted.",
    },
    unlockedLore: {
      type: Type.ARRAY,
      description: "An array of unique string IDs for lore entries that are newly revealed or explained in the current scene. Only include IDs from the provided list in the system instructions. Omit or leave empty if no new lore is revealed.",
      items: { type: Type.STRING },
    },
    intensity: {
        type: Type.STRING,
        description: "Rate the intensity of the current scene: 'low' for calm, expositional scenes; 'medium' for tense negotiations or discoveries; 'high' for combat, major revelations, or crises. Default to 'low' if unsure."
    }
  },
  required: ["scene", "choices", "intensity"],
};

export const getNextScene = async (history: StoryTurn[], choice: string | null, playerFaction: Faction, language: Language): Promise<GeminiResponse> => {
  try {
    const langString = language === 'fr' ? 'French' : 'English';
    const finalSystemInstruction = `${systemInstruction}\n\nIMPORTANT: All your responses, including the 'scene' and 'choices' properties in the JSON output, must be written entirely in ${langString}.`;

    let prompt;

    if (choice === null) {
      const playerFactionId = playerFaction.id;
      prompt = `Start a new game in the "Versefall" universe following the defined narrative structure. The player has chosen to lead the ${playerFaction.name}. Generate the opening scene as described in "ACT 1: The Rising Chaos": the dead are rising, and internal cults are sowing dissent. Provide three clear strategic choices for how to handle this initial crisis. The player's own faction lore ('${playerFactionId}') should be considered known, so you MUST include it in the 'unlockedLore' array in this first response. The entire response must be in ${langString}.`;
    } else {
      const context = history.map(turn => turn.scene).join('\n\n---\n\n');
      prompt = `The story so far:\n${context}\n\nThe player, leading the ${playerFaction.name}, chose to: "${choice}".\n\nContinue the story by strictly following the NARRATIVE STRUCTURE. Keep in mind the player's path towards one of the three endings (Tyrannical, Stagnation, or Awakening) based on their actions. Present a new scene with diplomatic, strategic, or direct warfare challenges. The three new choices should have meaningful consequences for their alliances and the war effort. If new lore is revealed, add its ID to the 'unlockedLore' array. If the conditions for an ending are met, conclude the story as instructed. The entire response must be in ${langString}.`;
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: finalSystemInstruction,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.8,
        topP: 0.9,
        // SECURITY: Filter out harmful content to protect users and the model
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
      },
    });
    
    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);

    if (!parsedResponse.scene || !Array.isArray(parsedResponse.choices)) {
      throw new Error("Invalid response format from API.");
    }

    return {
        scene: parsedResponse.scene,
        choices: parsedResponse.choices,
        ending: parsedResponse.ending || null,
        unlockedLore: parsedResponse.unlockedLore || [],
        intensity: parsedResponse.intensity || 'low',
    };

  } catch (error) {
    console.error("Error generating content from Gemini API");
    throw new Error("API_ERROR");
  }
};

// Mapping faction IDs or names to specific visual styles for consistent image generation
const FACTION_STYLES: Record<string, string> = {
    'Aethelgard Compact': 'High-tech industrial sci-fi, sleek metal drones, neon blue and orange lights, orbital views, mech warriors, clean lines, futuristic military base.',
    'Veridian Sovereignties': 'Organic biotechnology, ancient forests, giant glowing flora, mystical warriors with bone armor, green and purple bioluminescence, symbiosis of nature and tech.',
    'Chronomach Guilds': 'Cyberpunk dark alleyways, rain-slicked streets, excessive holographic ads, cybernetic implants, hackers, neon pink and cyan, gritty urban decay.',
    'Celestial Purity': 'White marble cathedrals in space, gold filigree, angelic constructs, blinding holy light, stained glass, pristine and sterile religious aesthetic.',
    'Ancient Weavers': 'Esoteric runes floating in air, cosmic nebulas, robes, magical rituals, surreal landscapes, bending reality, ethereal blue and violet energy.',
    'Pantheon Ascendant': 'Greek/Roman sci-fi architecture, statues of heroes, golden armor, energy spears, epic scale, bright sunlight, heroic poses, temple ships.'
};

export const generateImageForScene = async (sceneText: string, factionName: string): Promise<string> => {
    try {
        const factionStyle = FACTION_STYLES[factionName] || 'Retro sci-fi atmospheric';
        
        // Enhanced prompt for better consistency and no text
        const imagePrompt = `
        Create a high-quality, 16-bit pixel art masterpiece inspired by 90s SNES cinematic cutscenes. Wide aspect ratio.
        
        **VISUAL STYLE & ATMOSPHERE:**
        ${factionStyle}
        
        **SCENE DESCRIPTION:**
        ${sceneText}
        
        **IMPORTANT CONSTRAINTS:**
        - STYLE: Strict 16-bit pixel art. Dithering allowed. Limited color palette typical of retro consoles.
        - NO TEXT: Do NOT include any text, dialogue bubbles, HUDs, UI elements, labels, or logos. Pure illustration only.
        - COMPOSITION: Cinematic wide shot. Atmospheric lighting.
        `;

        const response = await ai.models.generateImages({
            model: IMAGEN_MODEL,
            prompt: imagePrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '16:9',
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("No image was generated.");
        }

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;

    } catch(error) {
        console.error("Error generating image from Gemini API");
        // Return a placeholder or re-throw, for now we'll just log and let it fail gracefully
        throw new Error("IMAGE_API_ERROR");
    }
}