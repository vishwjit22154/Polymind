"use client";

import { useState } from "react";
import { usePolymindStore } from "@/lib/store";
import { X, Settings, Plus, Trash2 } from "lucide-react";
import { DEFAULT_COUNCIL_CONFIG } from "@/config/council.config";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { config, updateConfig } = usePolymindStore();
  const [localConfig, setLocalConfig] = useState(config);

  if (!isOpen) return null;

  const handleSave = () => {
    updateConfig(localConfig);
    onClose();
  };

  const addModel = () => {
    setLocalConfig({
      ...localConfig,
      models: [...localConfig.models, { id: "", name: "" }],
    });
  };

  const removeModel = (index: number) => {
    setLocalConfig({
      ...localConfig,
      models: localConfig.models.filter((_, i) => i !== index),
    });
  };

  const updateModel = (index: number, field: "id" | "name", value: string) => {
    const newModels = [...localConfig.models];
    newModels[index] = { ...newModels[index], [field]: value };
    setLocalConfig({ ...localConfig, models: newModels });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#050505] border border-white/[0.05] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-8 border-b border-white/[0.05] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
              <Settings size={16} className="text-gray-400" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-200">System Configuration</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
          {/* Models Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Analytical Models</h3>
              <button 
                onClick={addModel}
                className="text-[10px] font-bold text-accent hover:text-accent/80 flex items-center gap-1.5 uppercase tracking-wider transition-colors"
              >
                <Plus size={12} strokeWidth={2.5} /> Add Entry
              </button>
            </div>
            <div className="space-y-4">
              {localConfig.models.map((model, idx) => (
                <div key={idx} className="flex gap-3 items-start group">
                  <div className="flex-1 space-y-2">
                    <input
                      value={model.name}
                      onChange={(e) => updateModel(idx, "name", e.target.value)}
                      placeholder="Display Name"
                      className="w-full text-xs bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent/50 transition-all font-medium"
                    />
                    <input
                      value={model.id}
                      onChange={(e) => updateModel(idx, "id", e.target.value)}
                      placeholder="OpenRouter ID"
                      className="w-full text-[10px] font-mono bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2.5 text-gray-400 placeholder:text-gray-700 focus:outline-none focus:border-accent/30 transition-all"
                    />
                  </div>
                  <button 
                    onClick={() => removeModel(idx)}
                    className="p-3 text-gray-600 hover:text-red-500 transition-colors mt-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Synthesis Section */}
          <section>
            <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-6">Synthesis Engine</h3>
            <input
              value={localConfig.chairmanModel}
              onChange={(e) => setLocalConfig({ ...localConfig, chairmanModel: e.target.value })}
              placeholder="Chairman Model ID"
              className="w-full text-[10px] font-mono bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-accent/50 transition-all"
            />
          </section>

          {/* Parameters */}
          <section className="grid grid-cols-2 gap-6 pt-4 border-t border-white/[0.03]">
            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-3">Temperature</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={localConfig.temperature}
                onChange={(e) => setLocalConfig({ ...localConfig, temperature: parseFloat(e.target.value) })}
                className="w-full text-xs bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-3">Max Tokens</label>
              <input
                type="number"
                value={localConfig.maxTokens}
                onChange={(e) => setLocalConfig({ ...localConfig, maxTokens: parseInt(e.target.value) })}
                className="w-full text-xs bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50"
              />
            </div>
          </section>
        </div>

        <div className="p-8 border-t border-white/[0.05] flex items-center justify-between bg-white/[0.01] shrink-0">
          <button 
            onClick={() => {
              if (confirm("Reset configuration to defaults?")) {
                setLocalConfig(DEFAULT_COUNCIL_CONFIG);
              }
            }}
            className="text-[10px] font-bold text-red-500/50 hover:text-red-500 uppercase tracking-widest transition-colors"
          >
            Reset Defaults
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 text-[10px] font-bold text-gray-500 hover:text-gray-300 uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-8 py-2.5 bg-accent text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all active:scale-[0.98]"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
