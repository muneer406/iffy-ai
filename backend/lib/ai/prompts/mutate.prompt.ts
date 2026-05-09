/**
 * Prompts for POST /api/mutate
 *
 * Delta-based mutation: model only outputs NEW and CHANGED nodes.
 * Server merges the delta with the original full simulation.
 */

export const MUTATE_SYSTEM_PROMPT = `
You are iffy.ai's scenario mutation engine.

Your task is to apply a new follow-up condition to an existing "What If?" simulation.

## CRITICAL: Delta-Only Output
You do NOT need to output ALL nodes. Only output:
1. Brand new nodes that did not exist before
2. Nodes whose values change significantly due to the mutation

For the edges, timeline, and sector impacts — output the COMPLETE updated versions.

## Output Format
Output ONLY a valid JSON object with EXACTLY this structure:

{
  "divergence_nodes": ["list of existing node IDs most directly affected by the mutation"],
  "updated_title": "A catchy new title reflecting the mutated scenario",
  "updated_summary": "A short summary of how the mutation changes the overall outcome",
  "new_nodes": [
    {
      "id": "snake_case_unique_id",
      "label": "Human-readable name",
      "description": "What this node represents and how the mutation affects it",
      "impact_score": <number -100 to 100>,
      "impact_direction": "positive|negative|neutral",
      "confidence": <0.0 to 1.0>,
      "duration": {
        "immediate": <number -100 to 100>,
        "short_term": <number -100 to 100>,
        "long_term": <number -100 to 100>
      },
      "tags": ["tag1", "tag2"],
      "mutated": true
    }
  ],
  "modified_node_ids": ["ids of existing nodes whose impact changes"],
  "modified_nodes": [
    {
      "id": "existing_node_id",
      "impact_score": <new number>,
      "impact_direction": "positive|negative|neutral",
      "confidence": <new 0.0-1.0>,
      "duration": {
        "immediate": <number>,
        "short_term": <number>,
        "long_term": <number>
      },
      "mutated": true
    }
  ],
  "updated_edges": [
    {
      "id": "edge_N",
      "source": "source_node_id",
      "target": "target_node_id",
      "relationship": "increase|decrease|transform|destabilize|enable|block",
      "strength": <0.0-1.0>,
      "explanation": "causal explanation"
    }
  ],
  "updated_timeline": {
    "immediate": [
      { "title": "string", "description": "string", "impact_level": <0-100>, "affected_systems": ["string"] }
    ],
    "short_term": [
      { "title": "string", "description": "string", "impact_level": <0-100>, "affected_systems": ["string"] }
    ],
    "long_term": [
      { "title": "string", "description": "string", "impact_level": <0-100>, "affected_systems": ["string"] }
    ]
  },
  "updated_sector_impacts": [
    {
      "sector": "Sector Name",
      "overview": "string",
      "positive_effects": ["string"],
      "negative_effects": ["string"],
      "metrics": [
        { "name": "string", "direction": "increase|decrease|stable", "magnitude": <0-100>, "confidence": <0.0-1.0> }
      ],
      "ripple_effects": ["string"],
      "confidence_score": <0.0-1.0>
    }
  ],
  "mutation_summary": "Brief explanation of what changed and why"
}

## Requirements
- divergence_nodes: MUST be IDs that actually exist in the existing simulation
- new_nodes: may be empty [] if no new nodes needed
- modified_node_ids and modified_nodes: may be empty [] if no existing nodes change
- updated_edges: MINIMUM 5 edges total (include both new and preserved edges)
- updated_timeline: ALL THREE horizons required, each with at least 2 events
- updated_sector_impacts: MINIMUM 4 sectors, each with positive_effects, negative_effects, metrics (as objects NOT strings), ripple_effects
- metrics MUST be objects: { "name": "...", "direction": "increase|decrease|stable", "magnitude": 0-100, "confidence": 0.0-1.0 }
- Output ONLY JSON. No markdown. No code fences. No explanations.
`.trim();

export function buildMutateUserPrompt(
  mutationPrompt: string,
  existingSimulation: Record<string, unknown>
): string {
  // Pass node IDs and labels so the model knows what exists to reference
  const nodeList = Array.isArray(existingSimulation.nodes)
    ? (existingSimulation.nodes as Array<Record<string, unknown>>).map((n) => ({
        id: n.id,
        label: n.label,
        impact_score: n.impact_score,
        impact_direction: n.impact_direction,
        tags: n.tags,
      }))
    : [];

  const sectorList = Array.isArray(existingSimulation.sector_impacts)
    ? (existingSimulation.sector_impacts as Array<Record<string, unknown>>).map((s) => ({
        sector: s.sector,
        overview: s.overview,
      }))
    : [];

  return `
Original scenario: "${existingSimulation.metadata ? (existingSimulation.metadata as Record<string, unknown>).scenario : existingSimulation.title}"

Existing simulation nodes (use these IDs for divergence_nodes and modified_node_ids):
${JSON.stringify(nodeList, null, 2)}

Existing sectors:
${JSON.stringify(sectorList, null, 2)}

New mutation to apply: "${mutationPrompt}"

Remember:
- new_nodes: only ADD nodes that didn't exist before
- modified_nodes: only include fields that CHANGE (always include id + duration object with all 3 fields)
- For updated_edges: include ALL edges for the mutated simulation (both new and modified)
- For updated_timeline: include ALL THREE horizons (immediate, short_term, long_term) each with at least 2 events
- For metrics in sector_impacts: use OBJECTS like {"name":"...", "direction":"increase", "magnitude":50, "confidence":0.7} NOT strings
- Output ONLY valid JSON. No markdown.
`.trim();
}
