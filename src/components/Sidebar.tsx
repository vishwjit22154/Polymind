"use client";

import { usePolymindStore } from "@/lib/store";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { 
    conversations, 
    activeConversationId, 
    setActiveConversation, 
    deleteConversation,
    setCurrentRun
  } = usePolymindStore();

  const handleNewChat = () => {
    setActiveConversation(null);
    setCurrentRun(null);
    // Force a small state reset for the UI
    window.dispatchEvent(new CustomEvent('new-chat'));
  };

  return (
    <div className="w-64 bg-black border-r border-white/[0.05] h-screen flex flex-col">
      <div className="p-6">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 bg-white/[0.03] border border-white/[0.05] py-2.5 px-4 rounded-xl text-xs font-medium hover:bg-white/[0.06] transition-all text-gray-300 active:scale-[0.98]"
        >
          <Plus size={14} strokeWidth={1.5} />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
        <div className="space-y-0.5">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all text-[13px] font-light",
                activeConversationId === conv.id 
                  ? "bg-white/[0.08] text-white shadow-lg" 
                  : "text-gray-400 hover:bg-white/[0.03] hover:text-gray-200"
              )}
              onClick={() => {
                setActiveConversation(conv.id);
                setCurrentRun(null);
              }}
            >
              <div className="flex items-center gap-3 truncate">
                <MessageSquare size={14} strokeWidth={1.5} className="shrink-0 opacity-40" />
                <span className="truncate">{conv.title || "New Chat"}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
              >
                <Trash2 size={12} strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="text-[10px] text-gray-800 uppercase tracking-[0.2em] font-bold">
          v0.1.0
        </div>
      </div>
    </div>
  );
}
