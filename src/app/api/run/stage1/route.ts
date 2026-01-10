import { NextRequest, NextResponse } from "next/server";
import { runStage1 } from "@/lib/openrouter";
import { CouncilConfig } from "@/config/council.config";

export async function POST(req: NextRequest) {
  try {
    const { prompt, config } = await req.json() as { prompt: string, config: CouncilConfig };
    const responses = await runStage1(prompt, config);
    return NextResponse.json({ responses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
