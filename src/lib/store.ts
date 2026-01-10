import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Conversation, RunStatus } from "@/types";
import { CouncilConfig, DEFAULT_COUNCIL_CONFIG } from "@/config/council.config";

interface PolymindState {
  conversations: Conversation[];
  activeConversationId: string | null;
  config: CouncilConfig;
  currentRun: RunStatus | null;
  
  // Actions
  addConversation: (conv: Conversation) => void;
  addTurnToConversation: (conversationId: string, turn: Turn) => void;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  updateConfig: (config: CouncilConfig) => void;
  setCurrentRun: (run: RunStatus | null) => void;
}

export const usePolymindStore = create<PolymindState>()(
  persist(
    (set) => ({
      conversations: [],
      activeConversationId: null,
      config: DEFAULT_COUNCIL_CONFIG,
      currentRun: null,

      addConversation: (conv) => 
        set((state) => ({ 
          conversations: [conv, ...state.conversations],
          activeConversationId: conv.id 
        })),

      addTurnToConversation: (conversationId, turn) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, turns: [...c.turns, turn] } : c
          ),
        })),
        
      deleteConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
        })),

      setActiveConversation: (id) => set({ activeConversationId: id }),
      
      updateConfig: (config) => set({ config }),
      
      setCurrentRun: (run) => set({ currentRun: run }),
    }),
    {
      name: "polymind-storage",
      partialize: (state) => ({ 
        conversations: state.conversations, 
        config: state.config 
      }),
    }
  )
);
