/**
 * Groq Provider
 * Uses OpenAI SDK with Groq's base URL (API-compatible)
 */

import OpenAI from "openai";
import { LLMProvider, LLMResponse, GenerateOptions } from "./types";

// Available Groq models
export const GROQ_MODELS = {
  "llama-3.3-70b-versatile": "Llama 3.3 70B",
  "llama-3.1-8b-instant": "Llama 3.1 8B (Fast)",
  "mixtral-8x7b-32768": "Mixtral 8x7B",
  "gemma2-9b-it": "Gemma 2 9B",
} as const;

export class GroqProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = "llama-3.3-70b-versatile") {
    this.client = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
      dangerouslyAllowBrowser: true, // Required for Chrome extension
    });
    this.model = model;
  }

  async generate(prompt: string, options: GenerateOptions): Promise<LLMResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: options.systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: options.temperature ?? 0.2,
        ...(options.forceJson && { response_format: { type: "json_object" } }),
      });

      return {
        content: response.choices[0]?.message?.content || "",
        inputTokens: response.usage?.prompt_tokens,
        outputTokens: response.usage?.completion_tokens,
      };
    } catch (error: any) {
      throw new Error(`Groq error: ${error.message || "Unknown error"}`);
    }
  }

  getModelId(): string {
    return this.model;
  }
}
