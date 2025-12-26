/**
 * Config Manager
 * Singleton class for managing extension configuration via chrome.storage.sync
 * Following BrowserBee pattern
 */

import { ProviderConfig } from "../models/providers/types";

export interface ExtensionConfig {
  // Provider settings
  provider: 'ollama' | 'groq' | 'gemini';
  
  // Ollama
  ollamaBaseUrl: string;
  ollamaModelId: string;
  
  // Groq
  groqApiKey: string;
  groqModelId: string;
  
  // Gemini
  geminiApiKey: string;
  geminiModelId: string;
  
  // Master resume (stored as YAML string)
  masterResumeYaml: string;
}

const DEFAULT_CONFIG: ExtensionConfig = {
  provider: 'groq',
  ollamaBaseUrl: 'http://localhost:11434',
  ollamaModelId: 'qwen3:4b',
  groqApiKey: '',
  groqModelId: 'llama-3.3-70b-versatile',
  geminiApiKey: '',
  geminiModelId: 'gemini-1.5-flash',
  masterResumeYaml: '',
};

export class ConfigManager {
  private static instance: ConfigManager;
  
  private constructor() {}
  
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }
  
  async getConfig(): Promise<ExtensionConfig> {
    const result = await chrome.storage.sync.get(DEFAULT_CONFIG);
    return result as ExtensionConfig;
  }
  
  async saveConfig(config: Partial<ExtensionConfig>): Promise<void> {
    await chrome.storage.sync.set(config);
  }
  
  async getProviderConfig(): Promise<ProviderConfig> {
    const config = await this.getConfig();
    
    switch (config.provider) {
      case 'ollama':
        return {
          provider: 'ollama',
          modelId: config.ollamaModelId,
          baseUrl: config.ollamaBaseUrl,
        };
      
      case 'groq':
        return {
          provider: 'groq',
          apiKey: config.groqApiKey,
          modelId: config.groqModelId,
        };
      
      case 'gemini':
        return {
          provider: 'gemini',
          apiKey: config.geminiApiKey,
          modelId: config.geminiModelId,
        };
      
      default:
        throw new Error(`Provider ${config.provider} not supported`);
    }
  }
  
  async getMasterResumeYaml(): Promise<string> {
    const config = await this.getConfig();
    return config.masterResumeYaml;
  }
  
  async setMasterResumeYaml(yaml: string): Promise<void> {
    await this.saveConfig({ masterResumeYaml: yaml });
  }
  
  async isConfigured(): Promise<boolean> {
    const config = await this.getConfig();
    
    // Check if provider has required config
    switch (config.provider) {
      case 'ollama':
        return !!config.ollamaBaseUrl && !!config.ollamaModelId;
      case 'groq':
        return !!config.groqApiKey;
      case 'gemini':
        return !!config.geminiApiKey;
      default:
        return false;
    }
  }
}
