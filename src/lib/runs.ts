import { RunStatus } from "@/types";

// Simple in-memory store for local development
// Note: This will reset on server restart
const runs = new Map<string, RunStatus>();

export function getRun(id: string): RunStatus | undefined {
  return runs.get(id);
}

export function updateRun(id: string, update: Partial<RunStatus>) {
  const existing = runs.get(id) || {
    id,
    stage: "idle",
    progress: 0,
  };
  runs.set(id, { ...existing, ...update } as RunStatus);
}
