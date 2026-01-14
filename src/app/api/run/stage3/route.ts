import { NextRequest, NextResponse } from "next/server";
import { runStage3 } from "@/lib/github-models";
import { EngineConfig } from "@/config/engine.config";
import { Stage1Response, Stage2Review } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { prompt, stage1Responses, stage2Reviews, config } = await req.json() as { 
      prompt: string, 
      stage1Responses: Stage1Response[], 
      stage2Reviews: Stage2Review[],
      config: EngineConfig 
    };
    const final = await runStage3(prompt, stage1Responses, stage2Reviews, config);
    return NextResponse.json({ final });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
