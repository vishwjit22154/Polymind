import { NextRequest, NextResponse } from "next/server";
import { runStage2 } from "@/lib/openrouter";
import { CouncilConfig } from "@/config/council.config";
import { Stage1Response } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { prompt, stage1Responses, config } = await req.json() as { 
      prompt: string, 
      stage1Responses: Stage1Response[], 
      config: CouncilConfig 
    };
    const reviews = await runStage2(prompt, stage1Responses, config);
    return NextResponse.json({ reviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
