import { expect, test, mock, spyOn } from "bun:test";

const mockGenerateContent = mock();
const mockGenerateImages = mock();

mock.module("@google/genai", () => {
  return {
    GoogleGenAI: class {
      constructor() {}
      models = {
        generateContent: mockGenerateContent,
        generateImages: mockGenerateImages
      }
    },
    Type: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      ARRAY: 'ARRAY'
    },
    HarmCategory: {
      HARM_CATEGORY_HATE_SPEECH: 'HATE_SPEECH',
      HARM_CATEGORY_HARASSMENT: 'HARASSMENT',
      HARM_CATEGORY_SEXUALLY_EXPLICIT: 'SEXUALLY_EXPLICIT',
      HARM_CATEGORY_DANGEROUS_CONTENT: 'DANGEROUS_CONTENT'
    },
    HarmBlockThreshold: {
      BLOCK_LOW_AND_ABOVE: 'BLOCK_LOW_AND_ABOVE',
      BLOCK_MEDIUM_AND_ABOVE: 'BLOCK_MEDIUM_AND_ABOVE'
    }
  };
});

// Mock environment variables before importing the service
process.env.VITE_GEMINI_API_KEY = "test-key";

// Mock console.error to avoid cluttering test output and to verify it was called
const consoleSpy = spyOn(console, 'error').mockImplementation(() => {});

test("getNextScene throws API_ERROR when Gemini API fails", async () => {
  // We import inside the test or use await import to ensure mocks are applied
  const { getNextScene } = await import("./geminiService");

  // Mock a failure from the API
  mockGenerateContent.mockRejectedValue(new Error("API Failure"));

  const history: any[] = [];
  const playerFaction = { id: 'test-faction', name: 'Test Faction' };
  const language: any = 'en';

  await expect(getNextScene(history, null, playerFaction, language)).rejects.toThrow("API_ERROR");

  expect(consoleSpy).toHaveBeenCalled();
});

test("getNextScene returns parsed response when Gemini API succeeds", async () => {
  const { getNextScene } = await import("./geminiService");

  // Mock a successful response
  const mockResponse = {
    text: JSON.stringify({
      scene: "A peaceful morning in the multiverse.",
      choices: ["Investigate the glow", "Stay put", "Call for help"],
      intensity: "low"
    })
  };
  mockGenerateContent.mockResolvedValue(mockResponse);

  const history: any[] = [];
  const playerFaction = { id: 'test-faction', name: 'Test Faction' };
  const language: any = 'en';

  const result = await getNextScene(history, null, playerFaction, language);

  expect(result.scene).toBe("A peaceful morning in the multiverse.");
  expect(result.choices).toHaveLength(3);
  expect(result.intensity).toBe("low");
});

test("getNextScene throws API_ERROR when Gemini API returns invalid JSON", async () => {
  const { getNextScene } = await import("./geminiService");

  // Mock an invalid JSON response
  mockGenerateContent.mockResolvedValue({
    text: "Invalid JSON response"
  });

  const history: any[] = [];
  const playerFaction = { id: 'test-faction', name: 'Test Faction' };
  const language: any = 'en';

  await expect(getNextScene(history, null, playerFaction, language)).rejects.toThrow("API_ERROR");
  expect(consoleSpy).toHaveBeenCalled();
});

test("generateImageForScene returns base64 string on success", async () => {
  const { generateImageForScene } = await import("./geminiService");

  mockGenerateImages.mockResolvedValue({
    generatedImages: [
      {
        image: {
          imageBytes: "fake-image-bytes"
        }
      }
    ]
  });

  const result = await generateImageForScene("A dragon", "Ancient Weavers");
  expect(result).toBe("data:image/png;base64,fake-image-bytes");
});

test("generateImageForScene throws IMAGE_API_ERROR on failure", async () => {
  const { generateImageForScene } = await import("./geminiService");

  mockGenerateImages.mockRejectedValue(new Error("Image API Failure"));

  await expect(generateImageForScene("A dragon", "Ancient Weavers")).rejects.toThrow("IMAGE_API_ERROR");
  expect(consoleSpy).toHaveBeenCalled();
});

test("getNextScene throws API_ERROR when Gemini API returns missing fields", async () => {
  const { getNextScene } = await import("./geminiService");

  // Mock a response with missing required fields (e.g., choices)
  mockGenerateContent.mockResolvedValue({
    text: JSON.stringify({
      scene: "Missing choices here"
    })
  });

  const history: any[] = [];
  const playerFaction = { id: 'test-faction', name: 'Test Faction' };
  const language: any = 'en';

  await expect(getNextScene(history, null, playerFaction, language)).rejects.toThrow("API_ERROR");
  expect(consoleSpy).toHaveBeenCalled();
});
