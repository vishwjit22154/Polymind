"use client";

import { useState } from "react";
import { Stage1Response, Stage2Review } from "@/types";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Star } from "lucide-react";

interface CouncilPanelProps {
  stage1Responses: Stage1Response[];
  stage2Reviews: Stage2Review[];
  loading?: boolean;
}

export function CouncilPanel({ stage1Responses, stage2Reviews, loading }: CouncilPanelProps) {
  const [activeTab, setActiveTab] = useState<string>("reviews");
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  const tabs = [
    { id: "reviews", label: "Reviews" },
    ...stage1Responses.map((r) => ({ id: r.label, label: r.label })),
  ];

  const toggleNote = (id: string) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="h-full flex flex-col border-l border-white/[0.05] bg-black">
      <div className="flex border-b border-white/[0.05] overflow-x-auto scrollbar-hide px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-4 text-[9px] uppercase tracking-[0.2em] font-bold transition-all relative whitespace-nowrap",
              activeTab === tab.id
                ? "text-accent"
                : "text-gray-600 hover:text-gray-400"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-accent" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {activeTab === "reviews" ? (
          <div className="space-y-6">
            {stage2Reviews.length === 0 ? (
              <div className="text-[9px] text-gray-800 text-center mt-20 uppercase tracking-[0.3em] font-black italic">
                {loading ? "Cross-Analysis in Progress" : "No analytical data"}
              </div>
            ) : (
              stage2Reviews.map((review, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-[1px] flex-1 bg-white/[0.05]" />
                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em] whitespace-nowrap">
                      Analysis by {stage1Responses.find(s => s.modelId === review.reviewerModelId)?.label || 'Expert'}
                    </span>
                    <div className="h-[1px] flex-1 bg-white/[0.05]" />
                  </div>
                  
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 space-y-5">
                    <p className="text-[13px] text-gray-500 italic leading-relaxed font-light">
                      "{review.reviewJson.overall_commentary}"
                    </p>

                    <div className="space-y-2">
                      {Object.entries(review.reviewJson.scores).map(([label, scores]) => (
                        <div key={label} className="bg-black/40 rounded-xl p-3 border border-white/[0.03]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-medium text-gray-400">{label}</span>
                            <div className="flex gap-2 text-[9px] font-mono text-gray-600">
                              <span className="opacity-50">A:{scores.accuracy}</span>
                              <span className="opacity-50">I:{scores.insight}</span>
                              <span className="opacity-50">C:{scores.clarity}</span>
                            </div>
                          </div>
                          <button 
                            className="w-full text-left group"
                            onClick={() => toggleNote(`${idx}-${label}`)}
                          >
                            <div className="flex items-center gap-2 text-[9px] text-gray-700 group-hover:text-gray-500 transition-colors uppercase tracking-wider">
                              {expandedNotes[`${idx}-${label}`] ? "Collapse Critique" : "View Critique"}
                            </div>
                            {expandedNotes[`${idx}-${label}`] && (
                              <p className="text-[12px] text-gray-500 mt-3 border-t border-white/[0.03] pt-3 leading-relaxed font-light">
                                {review.reviewJson.notes[label]}
                              </p>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            {stage1Responses.find((r) => r.label === activeTab)?.content.split("\n").map((line, i) => (
              <p key={i} className="text-[14px] leading-relaxed text-gray-500 font-light mb-4">
                {line}
              </p>
            )) || <p className="text-xs text-gray-700 uppercase tracking-widest text-center mt-20">Awaiting stream...</p>}
          </div>
        )}
      </div>
    </div>
  );
}
