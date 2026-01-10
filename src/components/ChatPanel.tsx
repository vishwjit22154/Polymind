"use client";

import { MessageSquare, User, Bot, Loader2 } from "lucide-react";
import { Conversation, RunStatus } from "@/types";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  conversation: Conversation | null;
  currentRun: RunStatus | null;
}

export function ChatPanel({ conversation, currentRun }: ChatPanelProps) {
  if (!conversation && !currentRun) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-black">
        <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.05] rounded-2xl flex items-center justify-center mb-6">
          <Bot className="text-gray-500" size={24} />
        </div>
        <h1 className="text-xl font-medium mb-3 tracking-tight text-gray-200">Perspective Synthesis</h1>
        <p className="text-gray-500 max-w-sm text-sm leading-relaxed font-light">
          Multiple expert models analyze your query to provide a peer-reviewed, single definitive answer.
        </p>
      </div>
    );
  }

  const prompt = conversation?.userPrompt || currentRun?.result?.userPrompt || "Preparing output...";
  const chairman = conversation?.chairmanResponse;
  
  return (
    <div className="flex-1 overflow-y-auto bg-black scrollbar-hide">
      <div className="max-w-2xl mx-auto py-20 px-6 space-y-16">
        {/* User Message */}
        <div className="flex gap-6 items-start">
          <div className="w-6 h-6 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center shrink-0 mt-1">
            <User size={12} className="text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="text-gray-300 leading-relaxed font-light text-[15px]">{prompt}</p>
          </div>
        </div>

        {/* Status indicator for active run */}
        {currentRun && currentRun.stage !== "completed" && (
          <div className="flex gap-6 items-start">
            <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-1">
              <Loader2 size={14} className="text-accent animate-spin" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between text-[10px] font-medium text-gray-500 uppercase tracking-[0.2em]">
                <span>Stage: {currentRun.stage}</span>
                <span>{currentRun.progress}%</span>
              </div>
              <div className="w-full h-[1px] bg-white/[0.05] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-700" 
                  style={{ width: `${currentRun.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 font-light">
                {getStageDescription(currentRun.stage)}
              </p>
            </div>
          </div>
        )}

        {/* Final Response */}
        {chairman && (
          <div className="flex gap-6 items-start">
            <div className="w-6 h-6 rounded-full bg-accent/[0.1] border border-accent/[0.2] flex items-center justify-center shrink-0 mt-1">
              <Bot size={12} className="text-accent" />
            </div>
            <div className="flex-1 prose prose-invert prose-sm max-w-none">
              <div className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-4">
                Synthesis
              </div>
              <div className="text-gray-200 leading-relaxed font-light text-[15px] whitespace-pre-wrap">
                {chairman}
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {currentRun?.stage === "error" && (
          <div className="bg-red-500/[0.02] border border-red-500/[0.1] p-8 rounded-3xl text-red-400/80 space-y-6">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-red-500/60">
              <span className="w-1.5 h-1.5 bg-red-500/40 rounded-full animate-pulse" />
              Execution Halted
            </div>
            <p className="text-[13px] leading-relaxed font-mono bg-black/40 p-5 rounded-2xl border border-white/[0.03] text-red-400/90">
              {currentRun.error}
            </p>
            <div className="flex pt-2">
              <button 
                onClick={() => window.location.reload()}
                className="text-[10px] font-bold uppercase tracking-widest text-white bg-red-500/10 hover:bg-red-500/20 px-6 py-3 rounded-xl transition-all border border-red-500/20"
              >
                Reset & Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getStageDescription(stage: RunStatus["stage"]) {
  switch (stage) {
    case "stage1": return "Generating initial opinions...";
    case "stage2": return "Performing cross-model reviews...";
    case "stage3": return "Synthesizing final response...";
    default: return "Initializing...";
  }
}
