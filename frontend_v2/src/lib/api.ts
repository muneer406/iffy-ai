/**
 * Central API client for the iffy.ai backend.
 * Dev:  http://localhost:3000
 * Prod: https://iffy-ai-backend.vercel.app
 */

import type {
  SimulationResponse,
  SectorImpact,
  MutationResponse,
  DebateResponse,
  Participant,
  DebateMessage,
} from "./types";

const BASE_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "http://localhost:3000" : "https://iffy-ai-backend.vercel.app");

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok || json.success === false) {
    const errorMsg = json.error?.message ?? json.message ?? (typeof json.error === "string" ? json.error : null) ?? `API error ${res.status}`;
    throw new Error(errorMsg);
  }

  // Backend wraps data in { success: true, data: ... }
  return (json.data ?? json) as T;
}

/** Run a new simulation for a given What-If scenario. */
export async function simulate(scenario: string): Promise<SimulationResponse> {
  return post<SimulationResponse>("/api/simulate", { scenario });
}

/** Apply a mutation to an existing simulation. */
export async function mutate(
  simulationId: string,
  existingState: unknown,
  mutationPrompt: string
): Promise<MutationResponse> {
  return post<MutationResponse>("/api/mutate", {
    simulation_id: simulationId,
    existing_state: existingState,
    mutation_prompt: mutationPrompt,
  });
}

/** Fetch a deep sector impact analysis. */
export async function sectorAnalysis(
  simulationId: string,
  sectorName: string
): Promise<SectorImpact> {
  return post<SectorImpact>("/api/sector", {
    simulation_id: simulationId,
    sector_name: sectorName,
  });
}

/** Generate debate participants or messages. */
export async function debate(
  simulationId: string,
  participants: Participant[],
  existingMessages: DebateMessage[],
  scenario: string,
  continuationPrompt?: string,
  mode?: "participants" | "messages" | "full"
): Promise<DebateResponse> {
  return post<DebateResponse>("/api/debate", {
    simulation_id: simulationId,
    participants,
    existing_messages: existingMessages,
    scenario,
    continuation_prompt: continuationPrompt,
    mode,
  });
}

export interface PostInput {
  author: string;
  title: string;
  description: string;
  scenario: string;
}

export interface CommunityPost extends PostInput {
  id: string;
  likes: number;
  timestamp: string;
}

export async function submitCommunityPost(data: PostInput): Promise<{ post: CommunityPost }> {
  return post<{ post: CommunityPost }>("/api/community", data);
}

export async function getCommunityPosts(): Promise<{ posts: CommunityPost[] }> {
  const res = await fetch(`${BASE_URL}/api/community`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error?.message ?? json.message ?? json.error ?? "Failed to fetch community posts");
  }
  return json.data ?? json;
}

export async function getMarketplaceItems(): Promise<any[]> {
  const res = await fetch(`${BASE_URL}/api/marketplace`);
  const json = await res.json();
  if (!res.ok || json.success === false) throw new Error("Failed to fetch marketplace");
  return json.data ?? json;
}

export async function getSavedScenarios(): Promise<any[]> {
  const res = await fetch(`${BASE_URL}/api/saved`);
  const json = await res.json();
  if (!res.ok || json.success === false) throw new Error("Failed to fetch saved");
  return json.data ?? json;
}

export async function getCommunityFeed(): Promise<{ trending: any[], marketplaceItems: any[], recentDiscussions: any[], featuredCreators: any[] }> {
  const res = await fetch(`${BASE_URL}/api/community/feed`);
  const json = await res.json();
  if (!res.ok || json.success === false) throw new Error("Failed to fetch feed");
  return json.data ?? json;
}
