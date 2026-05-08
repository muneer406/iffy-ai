import axios from "axios";
import type {
  SimulationResponse,
  MutationResponse,
  DebateResponse,
  SectorImpact,
  Participant,
  DebateMessage,
} from "@/types/simulation";

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://iffy-ai-backend.vercel.app"
    : "http://localhost:3000");

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 120_000, // 2 min — AI calls can be slow
});

// ─── Response unwrapper ────────────────────────────────────────────────────
// Backend wraps everything in { success: true, data: ... }
function unwrap<T>(response: { data: { success: boolean; data: T; error?: unknown } }): T {
  if (!response.data.success) {
    throw new Error(JSON.stringify(response.data.error) ?? "API error");
  }
  return response.data.data;
}

// ─── API Functions ─────────────────────────────────────────────────────────

/** POST /api/simulate — generate a full new simulation */
export async function simulate(
  scenario: string,
  durationFocus: string = "all"
): Promise<SimulationResponse> {
  const res = await api.post("/api/simulate", {
    scenario,
    duration_focus: durationFocus,
  });
  return unwrap(res);
}

/** POST /api/mutate — branch simulation with new condition */
export async function mutate(
  simulationId: string,
  existingState: Partial<SimulationResponse>,
  mutationPrompt: string
): Promise<MutationResponse> {
  const res = await api.post("/api/mutate", {
    simulation_id: simulationId,
    existing_state: existingState,
    mutation_prompt: mutationPrompt,
  });
  return unwrap(res);
}

/** POST /api/debate — generate or continue debate */
export async function debate(
  simulationId: string,
  participants: Participant[],
  existingMessages: DebateMessage[],
  scenario: string,
  continuationPrompt?: string
): Promise<DebateResponse> {
  const res = await api.post("/api/debate", {
    simulation_id: simulationId,
    participants,
    existing_messages: existingMessages,
    scenario,
    continuation_prompt: continuationPrompt,
  });
  return unwrap(res);
}

/** POST /api/sector — deep sector analysis */
export async function sectorAnalysis(
  simulationId: string,
  sector: string
): Promise<SectorImpact> {
  const res = await api.post("/api/sector", {
    simulation_id: simulationId,
    sector,
  });
  return unwrap(res);
}
