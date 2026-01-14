import { NextRequest, NextResponse, after } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { runStage1, runStage2, runStage3 } from "@/lib/github-models";
import { updateRun } from "@/lib/runs";
import { EngineConfig } from "@/config/engine.config";

export async function POST(req: NextRequest) {
  try {
    const { prompt, config, conversationId, history } = await req.json() as { 
      prompt: string, 
      config: EngineConfig, 
      conversationId?: string,
      history?: any[]
    };
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const runId = uuidv4();
    
    // Initialize run in the store immediately
    updateRun(runId, {
      id: runId,
      stage: "stage1",
      progress: 0,
    });

    // Use Next.js 'after' to ensure the process continues even after the response is sent
    // This is critical for Vercel deployment
    after(async () => {
      console.log(`[Run ${runId}] Starting synthesis for: ${prompt}`);
      try {
        // Stage 1
        updateRun(runId, { stage: "stage1", progress: 10 });
        const stage1Responses = await runStage1(prompt, config, history);
        updateRun(runId, { 
          progress: 40, 
          result: { 
            turns: [{ userPrompt: prompt, stage1Responses }] 
          } as any 
        });

        // Stage 2
        updateRun(runId, { stage: "stage2", progress: 50 });
        const stage2Reviews = await runStage2(prompt, stage1Responses, config, history);
        updateRun(runId, { 
          progress: 80, 
          result: { 
            turns: [{ userPrompt: prompt, stage1Responses, stage2Reviews }] 
          } as any 
        });

        // Stage 3
        updateRun(runId, { stage: "stage3", progress: 90 });
        const synthesisResponse = await runStage3(prompt, stage1Responses, stage2Reviews, config, history);
        
        const turn = {
          id: uuidv4(),
          userPrompt: prompt,
          stage1Responses,
          stage2Reviews,
          synthesisResponse,
          createdAt: Date.now(),
        };

        updateRun(runId, {
          stage: "completed",
          progress: 100,
          result: conversationId ? { turn } : {
            id: runId,
            title: prompt.substring(0, 40),
            turns: [turn],
            config,
            createdAt: Date.now(),
          } as any,
        });
        console.log(`[Run ${runId}] Synthesis completed successfully.`);
      } catch (error: any) {
        console.error(`[Run ${runId}] Background Process Failed:`, error);
        updateRun(runId, {
          stage: "error",
          error: error.message || "An unexpected error occurred during the background synthesis process.",
        });
      }
    });

    return NextResponse.json({ runId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
