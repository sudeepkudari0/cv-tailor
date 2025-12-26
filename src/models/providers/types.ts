/**
 * LLM Provider Types
 * Simplified interface for resume/cover letter generation (no streaming needed)
 */

export interface LLMResponse {
  content: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface GenerateOptions {
  systemPrompt: string;
  temperature?: number;
  forceJson?: boolean;
}

export interface LLMProvider {
  generate(prompt: string, options: GenerateOptions): Promise<LLMResponse>;
  getModelId(): string;
}

export interface ProviderConfig {
  provider: 'ollama' | 'groq' | 'gemini';
  apiKey?: string;
  modelId: string;
  baseUrl?: string;
}
