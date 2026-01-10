"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatComposer } from "@/components/ChatComposer";
import { Dashboard } from "@/components/Dashboard";
import { SettingsModal } from "@/components/SettingsModal";
import { usePolymindStore } from "@/lib/store";
import { Settings, Maximize2, LayoutPanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const { conversations, activeConversationId, currentRun } = usePolymindStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;
  const isRunning = currentRun !== null;

  return (
    <main className="flex h-screen bg-black overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative bg-black">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
              {isRunning ? "Engine: Running" : "System: Idle"}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-400 transition-all"
              title="Configuration"
            >
              <Settings size={16} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Dashboard Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <Dashboard 
              conversation={activeConversation} 
              currentRun={currentRun} 
            />
            {!isRunning && <ChatComposer />}
          </div>
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </main>
  );
}
