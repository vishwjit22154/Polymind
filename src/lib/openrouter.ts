import pLimit from "p-limit";
import pRetry from "p-retry";
import { z } from "zod";
import { 
  Stage1Response, 
  Stage2Review, 
  ReviewRanking, 
  Message 
} from "@/types";
import { EngineConfig } from "@/config/engine.config";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const BASE_URL = "https://models.github.ai/inference";

const RankingSchema = z.object({
  ranking: z.array(z.string()),
  scores: z.record(z.string(), z.object({
    accuracy: z.number().min(0).max(10).catch(5),
    insight: z.number().min(0).max(10).catch(5),
    clarity: z.number().min(0).max(10).catch(5),
  })),
  notes: z.record(z.string(), z.string()),
  overall_commentary: z.string(),
});

function cleanJsonResponse(content: string) {
  let cleaned = content.replace(/```json\n?/, "").replace(/```\n?$/, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    return cleaned.substring(start, end + 1);
  }
  return cleaned;
}

async function callOpenRouter(
  model: string,
  messages: Message[],
  config: Partial<EngineConfig> = {},
  jsonMode: boolean = false
) {
  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is not set. Please add it to your .env.local file.");
  }

  // Detect reasoning models (gpt-5, o1, o3)
  const isReasoningModel = 
    model.includes("/o1") || 
    model.includes("/o3") || 
    model.includes("/gpt-5");

  return pRetry(
    async () => {
      const body: any = {
        model,
        messages,
      };

      if (isReasoningModel) {
        body.max_completion_tokens = 2000; 
        body.reasoning_effort = "high";
      } else {
        body.temperature = config.temperature ?? 0.7;
        body.max_tokens = config.maxTokens ?? 2000;
      }

      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`GitHub API Error (${model}):`, JSON.stringify(errorData, null, 2));
        
        if (response.status === 429) {
          throw new Error(`RATE_LIMIT: ${errorData.error?.message || "Too many requests"}`);
        }
        
        throw new Error(errorData.error?.message || `GitHub Models error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      return jsonMode ? cleanJsonResponse(content) : content;
    },
    { 
      retries: 1,
      minTimeout: 5000,
    }
  );
}

export async function runStage1(
  prompt: string,
  config: EngineConfig,
  history: any[] = []
): Promise<Stage1Response[]> {
  const limit = pLimit(1);
  
  const historyMessages: Message[] = history.flatMap(h => [
    { role: "user", content: h.prompt },
    { role: "assistant", content: h.response }
  ]);

  const tasks = config.models.map((model, index) =>
    limit(async () => {
      try {
        if (index > 0) await new Promise(resolve => setTimeout(resolve, 2000));

        const messages: Message[] = [
          ...historyMessages,
          { role: "user", content: prompt }
        ];
        const content = await callOpenRouter(model.id, messages, config);
        return {
          modelId: model.id,
          modelName: model.name,
          label: `Model ${String.fromCharCode(65 + index)}`, 
          content,
        };
      } catch (e: any) {
        console.error(`Stage 1 fail: ${model.id}`, e);
        return {
          modelId: model.id,
          modelName: model.name,
          label: `Model ${String.fromCharCode(65 + index)}`, 
          content: `ERROR: ${e.message}`,
        };
      }
    })
  );

  return await Promise.all(tasks);
}

export async function runStage2(
  prompt: string,
  stage1Responses: Stage1Response[],
  config: EngineConfig,
  history: any[] = []
): Promise<Stage2Review[]> {
  const limit = pLimit(1);
  const historyText = history.map(h => `Q: ${h.prompt}\nA: ${h.response}`).join("\n\n");

  const tasks = config.models.map((reviewerModel, index) =>
    limit(async () => {
      try {
        if (index > 0) await new Promise(resolve => setTimeout(resolve, 3000));

        const otherResponses = stage1Responses.filter(r => 
          r.modelId !== reviewerModel.id && 
          !r.content.startsWith("ERROR:")
        );
        if (otherResponses.length === 0) return null;

        const anonymizedMapping: Record<string, string> = {};
        otherResponses.forEach(r => anonymizedMapping[r.label] = r.modelName);

        const responsesText = otherResponses.map(r => `### ${r.label}\n${r.content.substring(0, 1500)}`).join("\n\n");

        const systemPrompt = `Review the provided responses (Model A, Model B, etc.) for the LATEST query. 
Provide a JSON object ONLY:
{
  "ranking": ["Model A", "Model B"],
  "scores": { "Model A": { "accuracy": 1-10, "insight": 1-10, "clarity": 1-10 } },
  "notes": { "Model A": "critique" },
  "overall_commentary": "summary"
}`;

        const context = history.length > 0 ? `Context of previous conversation:\n${historyText}\n\n` : "";
        const userContent = `${context}Latest Prompt: ${prompt}\n\nCandidate Responses for the Latest Prompt:\n${responsesText}`;

        const content = await callOpenRouter(reviewerModel.id, [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ], config, true);

        const raw = JSON.parse(content);
        
        const getActualName = (key: string) => {
          const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, ""); 
          for (const label of Object.keys(anonymizedMapping)) {
            if (label.toUpperCase().replace(/[^A-Z]/g, "") === cleanKey) return anonymizedMapping[label];
            if (cleanKey.endsWith(label.replace("Model ", ""))) return anonymizedMapping[label];
          }
          return null;
        };

        const mappedScores: Record<string, any> = {};
        const mappedNotes: Record<string, string> = {};
        const mappedRanking: string[] = [];

        (raw.ranking || []).forEach((label: string) => {
          const name = getActualName(label);
          if (name) mappedRanking.push(name);
        });

        Object.entries(raw.scores || {}).forEach(([label, score]) => {
          const name = getActualName(label);
          if (name) mappedScores[name] = score;
        });

        Object.entries(raw.notes || {}).forEach(([label, note]) => {
          const name = getActualName(label);
          if (name) mappedNotes[name] = note as string;
        });

        return {
          reviewerModelId: reviewerModel.id,
          reviewJson: {
            ranking: mappedRanking,
            scores: mappedScores,
            notes: mappedNotes,
            overall_commentary: raw.overall_commentary || "No commentary provided."
          },
          anonymizedMappingUsed: anonymizedMapping,
        };
      } catch (e) {
        console.error(`Stage 2 fail: ${reviewerModel.id}`, e);
        return null;
      }
    })
  );

  return (await Promise.all(tasks)).filter((r): r is Stage2Review => r !== null);
}

export async function runStage3(
  prompt: string,
  stage1Responses: Stage1Response[],
  stage2Reviews: Stage2Review[],
  config: EngineConfig,
  history: any[] = []
): Promise<string> {
  const responsesText = stage1Responses
    .filter(r => !r.content.startsWith("ERROR:"))
    .map(r => `### ${r.modelName}\n${r.content.substring(0, 350)}... [Condensed for Synthesis]`)
    .join("\n\n");

  const reviewsText = stage2Reviews.map(rev => {
    const name = stage1Responses.find(s => s.modelId === rev.reviewerModelId)?.modelName || 'Expert';
    return `Review by ${name}: Ranking: ${rev.reviewJson.ranking.join(" > ")}, Summary: ${rev.reviewJson.overall_commentary.substring(0, 150)}`;
  }).join("\n\n");

  const historyText = history.map(h => `Q: ${h.prompt}\nA: ${h.response.substring(0, 100)}...`).join("\n\n");

  const systemPrompt = `You are an expert synthesizer. Produce a definitive final answer for the LATEST query.
1. Use clear headings and bullet points.
2. Resolve conflicts between models.`;

  const context = history.length > 0 ? `Brief History:\n${historyText}\n\n` : "";
  const userContent = `${context}Latest Prompt: ${prompt}\n\nModel Responses (Summarized):\n${responsesText}\n\nReview Summaries:\n${reviewsText}`;

  try {
    console.log(`[Synthesizer] Attempting synthesis with primary: ${config.synthesisModel}`);
    return await callOpenRouter(config.synthesisModel, [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent }
    ], config);
  } catch (error) {
    console.warn(`[Synthesizer Fallback] Primary ${config.synthesisModel} failed. Attempting fallback...`);
    
    const workingModels = stage1Responses.filter(r => !r.content.startsWith("ERROR:"));
    
    if (workingModels.length === 0) {
      throw new Error("No working models available to synthesize a response.");
    }

    const fallbackModel = workingModels.find(m => m.modelId.includes("openai")) || 
                          workingModels.find(m => m.modelId.includes("meta")) || 
                          workingModels[0];

    console.log(`[Synthesizer Fallback] Appointed ${fallbackModel.modelName} as emergency synthesizer.`);

    const fallbackSystemPrompt = `${systemPrompt}\nNOTE: You are acting as the emergency synthesizer because the primary engine hit a limit. Be extra thorough.`;

    return await callOpenRouter(fallbackModel.modelId, [
      { role: "system", content: fallbackSystemPrompt },
      { role: "user", content: userContent }
    ], config);
  }
}
