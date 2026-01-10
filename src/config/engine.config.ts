export const DEFAULT_ENGINE_CONFIG = {
  models: [
    { id: "meta/Llama-4-Maverick-17B-128E-Instruct-FP8", name: "Llama 4 Maverick (Meta)" },
    { id: "openai/o3", name: "o3 (OpenAI)" },
    { id: "mistral-ai/Codestral-2501", name: "Codestral 25.01 (Mistral)" },
    { id: "Phi-4", name: "Phi-4 (Microsoft)" },
  ],
  synthesisModel: "openai/gpt-5",
  temperature: 0.7,
  maxTokens: 2000,
};

export type ModelConfig = {
  id: string;
  name: string;
};

export type EngineConfig = {
  models: ModelConfig[];
  synthesisModel: string;
  temperature: number;
  maxTokens: number;
};
