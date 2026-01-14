"use client";

import { User, Bot, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Conversation, RunStatus, Stage1Response, Stage2Review, Turn } from "@/types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DashboardProps {
  conversation: Conversation | null;
  currentRun: RunStatus | null;
}

export function Dashboard({ conversation, currentRun }: DashboardProps) {
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  const toggleNote = (id: string) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!conversation && !currentRun) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-black">
        <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.05] rounded-2xl flex items-center justify-center mb-6">
          <Bot className="text-gray-600" size={24} />
        </div>
        <h1 className="text-xl font-medium mb-3 tracking-tight text-gray-300 uppercase tracking-[0.2em]">Analytical Dashboard</h1>
        <p className="text-gray-600 max-w-sm text-xs leading-relaxed font-light uppercase tracking-widest">
          Awaiting input to initialize the multi-stage synthesis pipeline.
        </p>
      </div>
    );
  }

  const isRunning = currentRun && currentRun.stage !== "completed";
  
  // Support multi-turn: show latest turn in columns
  const latestTurn = conversation?.turns[conversation.turns.length - 1];
  const activeTurn = isRunning ? (currentRun?.result as any)?.turns?.[0] : latestTurn;
  const isError = currentRun?.stage === "error";
  
  const prompt = activeTurn?.userPrompt || "Preparing data...";
  const stage1Responses = activeTurn?.stage1Responses || [];
  const stage2Reviews = activeTurn?.stage2Reviews || [];
  const synthesisResponse = isRunning ? "" : (activeTurn?.synthesisResponse || "");

  return (
    <div className="flex-1 flex flex-col bg-black overflow-hidden">
      {/* Top Section: Prompt & History */}
      <div className="px-4 md:px-8 pt-4 md:pt-8 pb-4 border-b border-white/[0.05] shrink-0">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Previous Turns (Compact) */}
          {conversation && conversation.turns.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
              {conversation.turns.slice(0, -1).map((turn: Turn, i: number) => (
                <div key={i} className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-[10px] text-gray-500 whitespace-nowrap">
                  {turn.userPrompt.substring(0, 30)}...
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 md:p-6 shadow-2xl relative overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center shrink-0 mt-1">
              <User size={14} className="text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-2">Primary Objective</div>
              <p className="text-gray-300 leading-relaxed font-light text-sm md:text-base sm:truncate">{prompt}</p>
            </div>
            {isRunning && (
               <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.05]">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest">
                   <Loader2 size={12} className="animate-spin" />
                   {currentRun.stage}
                 </div>
                 <div className="flex-1 sm:flex-none w-full sm:w-24 h-[1px] bg-white/[0.05] rounded-full overflow-hidden">
                   <div className="h-full bg-accent transition-all duration-700" style={{ width: `${currentRun.progress}%` }} />
                 </div>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Three Columns */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-y-auto xl:overflow-hidden p-4 md:p-8 gap-4 md:gap-8 max-w-[1800px] mx-auto w-full">
        
        {/* Column 1: Stage 1 - Opinions */}
        <div className={cn(
          "flex-1 flex flex-col bg-white/[0.01] border rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 min-h-[400px] xl:min-h-0",
          isRunning && currentRun.stage === "stage1" ? "border-accent shadow-[0_0_20px_rgba(0,122,255,0.15)] bg-accent/[0.02]" : "border-white/[0.05]"
        )}>
          <div className="p-5 border-b border-white/[0.05] bg-white/[0.02] flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Stage 1: Primary Opinions</h3>
              <div className="flex gap-1 mt-1.5">
                {stage1Responses.map((r, i) => (
                  <div key={i} className={cn(
                    "h-[2px] w-4 rounded-full",
                    r.content.startsWith("ERROR:") ? "bg-red-500" : "bg-accent"
                  )} />
                ))}
              </div>
            </div>
            <span className="text-[9px] text-gray-700 font-mono">{stage1Responses.length} Entries</span>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {stage1Responses.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[9px] text-gray-800 uppercase tracking-widest font-black italic">
                {isRunning && currentRun.stage === "stage1" ? "Models are thinking..." : "Awaiting Model Inputs"}
              </div>
            ) : (
              stage1Responses.map((resp: Stage1Response, i: number) => (
                <div key={i} className="bg-white/[0.02] border border-white/[0.03] rounded-2xl p-4 space-y-3 transition-all hover:bg-white/[0.04]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full bg-accent opacity-50",
                        resp.content.startsWith("ERROR:") && "bg-red-500 opacity-100 animate-pulse"
                      )} />
                      <span className="text-[10px] font-bold text-gray-200 uppercase tracking-wider">{resp.modelName}</span>
                    </div>
                    <span className="text-[8px] font-bold text-gray-700 uppercase bg-white/5 px-1.5 py-0.5 rounded">{resp.label}</span>
                  </div>
                  {resp.content.startsWith("ERROR:") ? (
                    <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                      <p className="text-[11px] text-red-400 font-mono break-words leading-relaxed">
                        {resp.content.replace("ERROR:", "").trim()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[13px] text-gray-500 leading-relaxed font-light line-clamp-[8] hover:line-clamp-none transition-all cursor-default">
                      {resp.content}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Stage 2 - Analysis */}
        <div className={cn(
          "flex-1 flex flex-col bg-white/[0.01] border rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 min-h-[400px] xl:min-h-0",
          isRunning && currentRun.stage === "stage2" ? "border-accent shadow-[0_0_20px_rgba(0,122,255,0.15)] bg-accent/[0.02]" : "border-white/[0.05]"
        )}>
          <div className="p-5 border-b border-white/[0.05] bg-white/[0.02] flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Stage 2: Peer Analysis</h3>
              {isRunning && currentRun.stage === "stage2" && (
                <div className="flex gap-1 mt-1.5 animate-pulse">
                  {[1,2,3].map(i => <div key={i} className="h-[2px] w-4 rounded-full bg-accent/40" />)}
                </div>
              )}
            </div>
            <span className="text-[9px] text-gray-700 font-mono">{stage2Reviews.length} Reviews</span>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            {stage2Reviews.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[9px] text-gray-800 uppercase tracking-widest font-black italic">
                {isRunning && currentRun.stage === "stage2" ? "Cross-analysis in progress..." : "Awaiting Synthesis Matrix"}
              </div>
            ) : (
              stage2Reviews.map((review: Stage2Review, idx: number) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                      Analysis by {stage1Responses.find((s: Stage1Response) => s.modelId === review.reviewerModelId)?.modelName || 'Expert'}
                    </span>
                    <div className="h-[1px] flex-1 bg-white/[0.05]" />
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 space-y-4">
                    <p className="text-[12px] text-gray-500 italic leading-relaxed font-light">
                      "{review.reviewJson.overall_commentary}"
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                              {Object.entries(review.reviewJson.scores).map(([label, scores]: [string, any]) => (
                                <div key={label} className="bg-black/40 rounded-xl p-3 border border-white/[0.03] space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                                    <span className="text-[8px] font-mono text-gray-600">
                                      AVG: {((scores.accuracy + scores.insight + scores.clarity) / 3).toFixed(1)}/10
                                    </span>
                                  </div>
                                  <div className="space-y-1.5">
                                    {[
                                      { name: "Accuracy", val: scores.accuracy, color: "bg-blue-500" },
                                      { name: "Insight", val: scores.insight, color: "bg-purple-500" },
                                      { name: "Clarity", val: scores.clarity, color: "bg-emerald-500" }
                                    ].map((s: { name: string, val: number, color: string }) => (
                                      <div key={s.name} className="flex items-center gap-3">
                                        <div className="w-12 text-[7px] uppercase tracking-tighter text-gray-600 font-bold">{s.name}</div>
                                        <div className="flex-1 h-[2px] bg-white/[0.03] rounded-full overflow-hidden">
                                          <div 
                                            className={cn("h-full rounded-full transition-all duration-1000", s.color)} 
                                            style={{ width: `${s.val * 10}%` }} 
                                          />
                                        </div>
                                        <div className="text-[7px] font-mono text-gray-500 w-3 text-right">{s.val}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Stage 3 - Final Output */}
        <div className={cn(
          "flex-1 flex flex-col bg-black border rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 min-h-[400px] xl:min-h-0",
          isRunning && currentRun.stage === "stage3" ? "border-accent shadow-[0_0_20px_rgba(0,122,255,0.15)] ring-1 ring-accent/20" : "border-white/[0.1]"
        )}>
          <div className="p-5 border-b border-white/[0.1] bg-white/[0.03] flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Stage 3: Verified Synthesis</h3>
              {isRunning && currentRun.stage === "stage3" && (
                <div className="h-[2px] w-full mt-1.5 bg-accent/20 overflow-hidden rounded-full">
                  <div className="h-full bg-accent animate-[loading_2s_ease-in-out_infinite]" />
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gradient-to-b from-black to-[#050505]">
            {isError ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                  <Bot className="text-red-500" size={20} />
                </div>
                <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Synthesis Failed</div>
                <div className="text-[11px] text-gray-500 font-light leading-relaxed max-w-xs mb-6">
                  {currentRun.error || "The synthesis engine hit a limit and the fallback also failed."}
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-white/[0.03] border border-white/[0.05] rounded-lg text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:bg-white/[0.08] transition-all"
                >
                  Reset & Try Again
                </button>
              </div>
            ) : !synthesisResponse ? (
              <div className="h-full flex items-center justify-center text-[9px] text-gray-800 uppercase tracking-widest font-black italic">
                {isRunning && currentRun.stage === "stage3" ? "Finalizing synthesis..." : "Awaiting Finalization"}
              </div>
            ) : (
              <div className="prose prose-invert prose-base max-w-none">
                <div className="text-white leading-relaxed font-light text-[17px] animate-in fade-in slide-in-from-bottom-4 duration-1000 markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {synthesisResponse}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
