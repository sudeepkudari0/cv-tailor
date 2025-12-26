/**
 * Gemini Provider
 * Uses @google/genai SDK
 */

import { GoogleGenAI } from "@google/genai";
import { LLMProvider, LLMResponse, GenerateOptions } from "./types";

// Available Gemini models
export const GEMINI_MODELS = {
  "gemini-1.5-flash": "Gemini 1.5 Flash (Fast)",
  "gemini-1.5-pro": "Gemini 1.5 Pro",
  "gemini-2.0-flash-exp": "Gemini 2.0 Flash (Experimental)",
} as const;

export class GeminiProvider implements LLMProvider {
  private client: GoogleGenAI;
  private model: string;

  constructor(apiKey: string, model: string = "gemini-1.5-flash") {
    this.client = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  async generate(prompt: string, options: GenerateOptions): Promise<LLMResponse> {
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          systemInstruction: options.systemPrompt,
          temperature: options.temperature ?? 0.2,
        },
      });

      const text = response.text || "";
      
      return {
        content: text,
        inputTokens: response.usageMetadata?.promptTokenCount,
        outputTokens: response.usageMetadata?.candidatesTokenCount,
      };
    } catch (error: any) {
      throw new Error(`Gemini error: ${error.message || "Unknown error"}`);
    }
  }

  getModelId(): string {
    return this.model;
  }
}
