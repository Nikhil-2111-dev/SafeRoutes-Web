import { GoogleGenAI } from '@google/genai';

export class AIService {
  private ai: GoogleGenAI;

  constructor() {
    // Gemini API key should be set in GEMINI_API_KEY environment variable
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. Image analysis will fail.");
    }
    this.ai = new GoogleGenAI();
  }

  /**
   * Analyzes a base64 encoded image and returns a JSON string with tags and a description.
   * @param base64Image Base64 string of the image (without the data:image/jpeg;base64, prefix)
   * @param mimeType The mime type of the image (e.g., 'image/jpeg')
   */
  async analyzeIncidentImage(base64Image: string, mimeType: string = 'image/jpeg') {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: "Analyze this image for safety routing purposes. Provide a brief description of what you see. Also provide an array of tags that apply, choosing from: 'well-lit', 'poorly-lit', 'dirty', 'walker-friendly', 'dangerous', 'unsafe', 'police-presence', 'hazard', 'safe-area'. Return ONLY a JSON object with two keys: 'description' (string) and 'tags' (array of strings). Do not use markdown blocks."
              },
              {
                inlineData: {
                  data: base64Image,
                  mimeType: mimeType
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        }
      });

      const textResponse = response.text;
      if (!textResponse) {
        throw new Error("No text response from Gemini");
      }

      return JSON.parse(textResponse);
    } catch (error) {
      console.error("Error analyzing image with Gemini:", error);
      throw error;
    }
  }
}
