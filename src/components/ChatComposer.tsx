"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { usePolymindStore } from "@/lib/store";

export function ChatComposer() {
  const [prompt, setPrompt] = useState("");
  const { config, addConversation, addTurnToConversation, setCurrentRun, activeConversationId, conversations } = usePolymindStore();
  const [loading, setLoading] = useState(false);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    const currentPrompt = prompt;
    setPrompt("");

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: currentPrompt, 
          config,
          conversationId: activeConversationId,
                  history: activeConversation?.turns.map(t => ({
                    prompt: t.userPrompt,
                    response: t.synthesisResponse
                  }))
        }),
      });

      if (!response.ok) throw new Error("Failed to start run");

      const { runId } = await response.json();
      
      // Start polling
      pollStatus(runId);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const pollStatus = async (runId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/run/status?runId=${runId}`);
        const status = await res.json();
        
        if (status.error) {
          setCurrentRun({ ...status, stage: "error" });
          clearInterval(interval);
          setLoading(false);
          return;
        }
        
        setCurrentRun(status);

        if (status.stage === "completed") {
          clearInterval(interval);
          setLoading(false);
          
          if (activeConversationId && status.result.turn) {
            addTurnToConversation(activeConversationId, status.result.turn);
          } else {
            addConversation(status.result);
          }
          
          setCurrentRun(null);
        } else if (status.stage === "error") {
          clearInterval(interval);
          setLoading(false);
        }
      } catch (err) {
        console.error("Polling error:", err);
        clearInterval(interval);
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="p-6 bg-black">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto relative group">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type a message..."
          className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl py-4 pl-5 pr-14 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-white/[0.1] focus:bg-white/[0.05] transition-all resize-none min-h-[56px] font-light"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={!prompt.trim() || loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-accent disabled:opacity-0 transition-all"
        >
          <Send size={18} strokeWidth={1.5} />
        </button>
      </form>
      <p className="text-[9px] text-center text-gray-700 mt-4 uppercase tracking-[0.2em] font-medium">
        Peer-Reviewed Perspective Engine
      </p>
    </div>
  );
}
