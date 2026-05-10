// ⚠️ MOCK DATA — these constants drive the demo simulation values shown
// in the Flow, Impacts, and Community pages. They are NOT computed by an AI
// model. Replace with real API output when you wire up a scenario engine.

export type ImpactState = "positive" | "negative" | "uncertain" | "systemic";

export interface ScenarioNode {
  id: string;
  title: string;
  icon: string;
  state: ImpactState;
  impact: number; // -100..100
  duration: "Immediate" | "Short-Term" | "Long-Term";
  summary: string;
  positives: string[];
  negatives: string[];
  ripples: string[];
}

export interface ScenarioEdge {
  id: string;
  source: string;
  target: string;
  strength: number; // 1..5
}

export const defaultScenario = {
  title: "What if AI replaces teachers?",
  prompt: "AI replaces teachers",
  // MOCK: nodes & edges are hand-authored for the demo.
  nodes: [
    { id: "education", title: "Education", icon: "🎓", state: "systemic", impact: 72, duration: "Immediate",
      summary: "Mass restructuring of curriculum delivery and pedagogy.",
      positives: ["Hyper-personalized learning", "24/7 availability", "Lower cost at scale"],
      negatives: ["Loss of mentorship", "Reduced socialization", "Equity gaps"],
      ripples: ["Hiring", "Society", "Government"] },
    { id: "hiring", title: "Hiring", icon: "💼", state: "negative", impact: -54, duration: "Short-Term",
      summary: "Educator labor market collapses; new EdTech roles emerge.",
      positives: ["Growth in AI tutor designers", "New evaluator roles"],
      negatives: ["Mass teacher displacement", "Wage suppression"],
      ripples: ["Economy", "Society"] },
    { id: "economy", title: "Economy", icon: "📈", state: "uncertain", impact: 18, duration: "Long-Term",
      summary: "Productivity gains, but concentrated in EdTech capital.",
      positives: ["Lower consumer ed costs", "GDP boost from AI sector"],
      negatives: ["Wealth concentration", "Skill polarization"],
      ripples: ["Government", "Society"] },
    { id: "society", title: "Society", icon: "🏛", state: "negative", impact: -38, duration: "Long-Term",
      summary: "Erosion of communal learning rituals.",
      positives: ["Self-directed learners thrive"],
      negatives: ["Loneliness rises", "Civic skills decline"],
      ripples: ["Mental Health", "Government"] },
    { id: "government", title: "Government", icon: "⚖️", state: "systemic", impact: 30, duration: "Long-Term",
      summary: "New regulatory frameworks for AI accreditation.",
      positives: ["Standardized AI curricula"],
      negatives: ["Slow legislation", "Lobbying capture"],
      ripples: ["Education", "Economy"] },
    { id: "tech", title: "Technology", icon: "🧠", state: "positive", impact: 84, duration: "Immediate",
      summary: "EdTech becomes a trillion-dollar arena.",
      positives: ["Rapid AI tutor innovation", "Open learning models"],
      negatives: ["Vendor lock-in", "Privacy concerns"],
      ripples: ["Economy", "Education"] },
    { id: "mental", title: "Mental Health", icon: "🫀", state: "negative", impact: -42, duration: "Long-Term",
      summary: "Reduced peer interaction reshapes adolescent wellbeing.",
      positives: ["Personalized pacing reduces academic stress"],
      negatives: ["Isolation", "Screen fatigue"],
      ripples: ["Society"] },
    { id: "env", title: "Environment", icon: "🌱", state: "positive", impact: 22, duration: "Long-Term",
      summary: "Less commuting; higher data-center energy.",
      positives: ["Lower transit emissions"],
      negatives: ["Compute emissions rise"],
      ripples: ["Economy"] },
  ] as ScenarioNode[],
  edges: [
    { id: "e1", source: "tech", target: "education", strength: 5 },
    { id: "e2", source: "education", target: "hiring", strength: 4 },
    { id: "e3", source: "education", target: "society", strength: 3 },
    { id: "e4", source: "hiring", target: "economy", strength: 4 },
    { id: "e5", source: "economy", target: "government", strength: 3 },
    { id: "e6", source: "society", target: "mental", strength: 4 },
    { id: "e7", source: "government", target: "education", strength: 2 },
    { id: "e8", source: "tech", target: "env", strength: 2 },
    { id: "e9", source: "society", target: "government", strength: 2 },
    { id: "e10", source: "mental", target: "society", strength: 2 },
  ] as ScenarioEdge[],
};

export const promptExamples = [
  "AI replaces teachers",
  "Countries ban cars",
  "Social media disappears",
  "Remote work becomes mandatory",
  "Degrees stop mattering",
  "Money loses value overnight",
  "Humans live to 200",
  "Universal basic income launches globally",
  "Crypto replaces banking",
  "Robots run all factories",
  "Space tourism goes mainstream",
  "Climate engineering succeeds",
];

export interface Persona {
  id: string;
  name: string;
  role: string;
  stance: string;
  bias: string;
  color: string;
}

// Pool the user can pick from in the "Regenerate participants" dialog.
export const personaPool: Persona[] = [
  { id: "student", name: "Maya", role: "Student", stance: "Cautiously optimistic", bias: "Gen-Z idealist", color: "from-sky-400 to-cyan-300" },
  { id: "parent", name: "Daniel", role: "Parent", stance: "Skeptical", bias: "Risk-averse", color: "from-amber-400 to-rose-400" },
  { id: "econ", name: "Dr. Reyes", role: "Economist", stance: "Pro-efficiency", bias: "Market-first", color: "from-violet-400 to-fuchsia-400" },
  { id: "ceo", name: "Aiko", role: "EdTech CEO", stance: "Bullish", bias: "Growth-driven", color: "from-emerald-400 to-teal-300" },
  { id: "pol", name: "Sen. Okafor", role: "Politician", stance: "Regulatory", bias: "Public-interest", color: "from-indigo-400 to-blue-400" },
  { id: "teach", name: "Ms. Liu", role: "Teacher", stance: "Opposed", bias: "Mentorship-first", color: "from-rose-400 to-pink-400" },
  { id: "scientist", name: "Dr. Park", role: "Scientist", stance: "Evidence-driven", bias: "Empirical", color: "from-cyan-400 to-blue-500" },
  { id: "ethicist", name: "Prof. Adamu", role: "Ethicist", stance: "Cautionary", bias: "Rights-first", color: "from-purple-400 to-indigo-500" },
  { id: "futurist", name: "Kira", role: "Futurist", stance: "Accelerationist", bias: "Long-horizon", color: "from-fuchsia-400 to-pink-500" },
  { id: "activist", name: "Rosa", role: "Activist", stance: "Equity-first", bias: "Grassroots", color: "from-orange-400 to-red-500" },
];

export const defaultParticipantIds = ["student", "parent", "econ", "ceo", "pol", "teach"];

export const debateMessages = [
  { id: 1, who: "ceo", text: "Personalized AI tutors can outperform any single teacher across millions of students simultaneously. The economics are undeniable." },
  { id: 2, who: "teach", text: "Teaching is not just information transfer. Students learn empathy, collaboration, and resilience from human mentors." },
  { id: 3, who: "econ", text: "Productivity gains in education compound across every industry. We can't ignore the ten-year GDP curve." },
  { id: 4, who: "parent", text: "I want my child to make friends and learn from people, not stare at a screen for eight hours a day." },
  { id: 5, who: "student", text: "Honestly? I'd love an AI that adapts to me. But I'd hate losing my favorite teachers." },
  { id: 6, who: "pol", text: "Any rollout must include accreditation standards, privacy guarantees, and a transition fund for displaced educators." },
];

export const savedScenarios = [
  { id: "s1", title: "What if remote work becomes mandatory?", summary: "Distributed labor reshapes cities and real-estate.", updated: "2 days ago", tags: ["Work","Cities","Economy"] },
  { id: "s2", title: "What if degrees stop mattering?", summary: "Skills-based hiring rebuilds the credential economy.", updated: "5 days ago", tags: ["Education","Hiring"] },
  { id: "s3", title: "What if social media disappears?", summary: "Attention economy collapses; local media revives.", updated: "1 week ago", tags: ["Society","Media"] },
  { id: "s4", title: "What if every car is autonomous?", summary: "Insurance, urban planning, and freight overhaul.", updated: "2 weeks ago", tags: ["Mobility","Cities"] },
];

export const marketplaceItems = [
  { id: "m1", title: "Universal Basic Income, Globally", creator: "@futurist.eli", tags: ["Economy","Policy"], likes: 1240, summary: "Tracing UBI ripple effects across 12 sectors." },
  { id: "m2", title: "Climate Engineering Succeeds", creator: "@gaia.lab", tags: ["Climate","Tech"], likes: 980, summary: "Stratospheric aerosol injection at scale." },
  { id: "m3", title: "Crypto Replaces Banking", creator: "@blocksophy", tags: ["Finance","Tech"], likes: 2100, summary: "Defi rails replace correspondent banking." },
  { id: "m4", title: "Humans Live to 200", creator: "@long.now", tags: ["Health","Society"], likes: 1730, summary: "Longevity reshapes pensions, family, work." },
  { id: "m5", title: "Quantum Computing Breaks RSA", creator: "@qubit.io", tags: ["Tech","Security"], likes: 870, summary: "Cryptographic apocalypse and PQC migration." },
  { id: "m6", title: "Space Mining Goes Mainstream", creator: "@orbital", tags: ["Space","Economy"], likes: 640, summary: "Asteroid metals collapse terrestrial markets." },
];

export const trending = [
  { id: "t1", title: "AI replaces doctors", engagement: "12.4k", reactions: "🔥 2.1k", preview: "Diagnostic accuracy soars; bedside trust falls." },
  { id: "t2", title: "Cities ban private cars", engagement: "8.7k", reactions: "💬 980", preview: "15-minute neighborhoods reshape commerce." },
  { id: "t3", title: "Generative AI is regulated globally", engagement: "15.2k", reactions: "⚡ 3.4k", preview: "A new compliance economy emerges." },
  { id: "t4", title: "All learning becomes asynchronous", engagement: "5.9k", reactions: "📚 1.1k", preview: "Time-zone agnostic universities scale." },
];

export const recentDiscussions = [
  { id: "d1", who: "Aiko", handle: "@gaia.lab", text: "Equity gap is the missing axis on every AI-replaces-X simulation.", thread: "She's been arguing all week that confidence intervals look fake without an equity dimension. Three replies." },
  { id: "d2", who: "Daniel", handle: "@long.now", text: "Long-term projections on UBI feel overstated to me.", thread: "Notes a 10-year horizon where second-order political effects swamp the first-order income boost." },
  { id: "d3", who: "Sen. Okafor", handle: "@orbital", text: "Has anyone modeled the regulatory delay variable?", thread: "Proposes a forking branch where regulation lags adoption by 36 months. 8 replies." },
];

export const featuredCreators = [
  { handle: "@futurist.eli", name: "Eli Hart", bio: "Building scenarios on labor markets and AI alignment.", scenarios: 24, color: "from-sky-400 to-violet-500" },
  { handle: "@gaia.lab", name: "Aiko Tanaka", bio: "Climate, energy, and biosphere systems modeller.", scenarios: 31, color: "from-emerald-400 to-cyan-400" },
  { handle: "@blocksophy", name: "Marcus Vela", bio: "Decentralized finance and post-state economics.", scenarios: 18, color: "from-rose-400 to-amber-400" },
  { handle: "@long.now", name: "Daniel Cho", bio: "Long-horizon thinking about institutions and culture.", scenarios: 42, color: "from-fuchsia-400 to-indigo-400" },
  { handle: "@qubit.io", name: "Priya Singh", bio: "Quantum, cryptography, and post-quantum migration.", scenarios: 12, color: "from-cyan-400 to-blue-500" },
  { handle: "@orbital", name: "Mateo Silva", bio: "Space economy, asteroid mining, off-world governance.", scenarios: 9, color: "from-amber-400 to-rose-400" },
];
