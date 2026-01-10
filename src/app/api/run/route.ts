import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { runStage1, runStage2, runStage3 } from "@/lib/openrouter";
import { updateRun, getRun } from "@/lib/runs";
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
    
    // Initialize run
    updateRun(runId, {
      id: runId,
      stage: "stage1",
      progress: 0,
    });

    console.log(`Run ${runId} initialized.`);

    // Start processing in the background
    (async () => {
      console.log(`Starting run ${runId} for prompt: ${prompt}`);
      try {
        // Stage 1
        console.log(`[Run ${runId}] Stage 1 starting...`);
        updateRun(runId, { stage: "stage1", progress: 10 });
        const stage1Responses = await runStage1(prompt, config, history);
        console.log(`[Run ${runId}] Stage 1 complete. Responses: ${stage1Responses.length}`);
        updateRun(runId, { progress: 40, result: { turns: [{ userPrompt: prompt, stage1Responses }] } as any });

        // Stage 2
        console.log(`[Run ${runId}] Stage 2 starting...`);
        updateRun(runId, { stage: "stage2", progress: 50 });
        const stage2Reviews = await runStage2(prompt, stage1Responses, config, history);
        console.log(`[Run ${runId}] Stage 2 complete. Reviews: ${stage2Reviews.length}`);
        updateRun(runId, { progress: 80, result: { turns: [{ userPrompt: prompt, stage1Responses, stage2Reviews }] } as any });

        // Stage 3
        console.log(`[Run ${runId}] Stage 3 starting...`);
        updateRun(runId, { stage: "stage3", progress: 90 });
        const synthesisResponse = await runStage3(prompt, stage1Responses, stage2Reviews, config, history);
        console.log(`[Run ${runId}] Stage 3 complete.`);
        
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
      } catch (error: any) {
        console.error(`[Run ${runId}] Failed:`, error);
        updateRun(runId, {
          stage: "error",
          error: error.message || "An unexpected error occurred during the run.",
        });
      }
    })();

    // Wait briefly to ensure the run is in the store before responding
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({ runId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
