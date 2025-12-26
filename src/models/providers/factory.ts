/**
 * Provider Factory
 * Creates the appropriate LLM provider based on config
 */

import { LLMProvider, ProviderConfig } from "./types";
import { OllamaProvider } from "./ollama";
import { GroqProvider } from "./groq";
import { GeminiProvider } from "./gemini";

export async function createProvider(config: ProviderConfig): Promise<LLMProvider> {
  switch (config.provider) {
    case "ollama":
      return new OllamaProvider(
        config.baseUrl || "http://localhost:11434",
        config.modelId
      );
    
    case "groq":
      if (!config.apiKey) {
        throw new Error("Groq API key is required");
      }
      return new GroqProvider(config.apiKey, config.modelId);
    
    case "gemini":
      if (!config.apiKey) {
        throw new Error("Gemini API key is required");
      }
      return new GeminiProvider(config.apiKey, config.modelId);
    
    default:
      throw new Error(`Provider ${config.provider} not supported`);
  }
}
