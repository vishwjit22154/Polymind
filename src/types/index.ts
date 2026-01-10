import { EngineConfig } from "@/config/engine.config";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface Stage1Response {
  modelId: string;
  modelName: string;
  label: string; // Model A, Model B, etc.
  content: string;
}

export interface ReviewRanking {
  ranking: string[]; // Labels in best -> worst order
  scores: Record<string, {
    accuracy: number;
    insight: number;
    clarity: number;
  }>;
  notes: Record<string, string>;
  overall_commentary: string;
}

export interface Stage2Review {
  reviewerModelId: string;
  reviewJson: ReviewRanking;
  anonymizedMappingUsed: Record<string, string>; // label -> modelId
}

export interface Turn {
  id: string;
  userPrompt: string;
  stage1Responses: Stage1Response[];
  stage2Reviews: Stage2Review[];
  synthesisResponse: string;
  createdAt: number;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  turns: Turn[];
  config: EngineConfig;
}

export interface RunStatus {
  id: string;
  stage: "idle" | "stage1" | "stage2" | "stage3" | "completed" | "error";
  progress: number; // 0-100
  error?: string;
  result?: Partial<Conversation>;
}
