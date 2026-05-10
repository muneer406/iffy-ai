import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { AppTabs } from "@/components/AppTabs";
import { useSimulationStore } from "@/lib/store";
import { useEffect } from "react";
import { debate as apiDebate } from "@/lib/api";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Simulation — iffy.ai" },
      { name: "description", content: "Explore an interactive ripple-effect simulation of your what-if scenario." },
    ],
  }),
  beforeLoad: ({ location }) => {
    if (location.pathname === "/app") {
      throw redirect({ to: "/app/flow" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const { simulation, isLoading, debateParticipants, setDebate, setDebateLoading } = useSimulationStore();

  // If no simulation loaded and not loading, redirect to home
  useEffect(() => {
    if (!simulation && !isLoading) {
      navigate({ to: "/" });
    }
  }, [simulation, isLoading, navigate]);

  // Background fetch debate participants when simulation first loads (if not already fetched)
  useEffect(() => {
    if (!simulation) return;
    if (debateParticipants.length > 0) return;
    const scenario = simulation.metadata?.scenario ?? simulation.title;
    setDebateLoading(true);
    apiDebate(simulation.simulation_id, [], [], scenario, undefined, "participants")
      .then((res) => setDebate(res.participants, res.messages))
      .catch(console.error)
      .finally(() => setDebateLoading(false));
  }, [simulation?.simulation_id]);

  const scenarioTitle = simulation?.metadata?.scenario ?? simulation?.title ?? "";

  return (
    <div className="bg-app min-h-screen">
      <Navbar scenarioTitle={scenarioTitle} />
      <AppTabs />
      <Outlet />
    </div>
  );
}
