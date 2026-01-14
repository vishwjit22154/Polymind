"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatComposer } from "@/components/ChatComposer";
import { Dashboard } from "@/components/Dashboard";
import { SettingsModal } from "@/components/SettingsModal";
import { usePolymindStore } from "@/lib/store";
import { Settings, Maximize2, LayoutPanelLeft, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const { conversations, activeConversationId, currentRun } = usePolymindStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;
  const isRunning = currentRun !== null;

  return (
    <main className="flex h-screen bg-black overflow-hidden relative">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>
      
      <div className="flex-1 flex flex-col relative bg-black min-w-0">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 md:px-8 shrink-0 z-10 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] hidden sm:inline">
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
