/**
 * Ollama Provider
 * Uses ollama/browser SDK for browser-compatible requests
 */

import { Ollama } from "ollama/browser";
import { LLMProvider, LLMResponse, GenerateOptions } from "./types";

export class OllamaProvider implements LLMProvider {
  private client: Ollama;
  private model: string;

  constructor(baseUrl: string = "http://localhost:11434", model: string = "qwen3:4b") {
    this.client = new Ollama({ host: baseUrl });
    this.model = model;
  }

  async generate(prompt: string, options: GenerateOptions): Promise<LLMResponse> {
    try {
      const response = await this.client.chat({
        model: this.model,
        messages: [
          { role: "system", content: options.systemPrompt },
          { role: "user", content: prompt }
        ],
        options: {
          temperature: options.temperature ?? 0.2,
          num_ctx: 32768,
        },
        // Disable thinking mode for Qwen models
        ...(this.model.includes("qwen") && { think: false }),
      });

      return {
        content: response.message.content,
        inputTokens: response.prompt_eval_count,
        outputTokens: response.eval_count,
      };
    } catch (error: any) {
      throw new Error(`Ollama error: ${error.message || "Unknown error"}`);
    }
  }

  getModelId(): string {
    return this.model;
  }
}
