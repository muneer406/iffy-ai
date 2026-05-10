import { Link, useRouterState } from "@tanstack/react-router";
import { Network, BarChart3, MessagesSquare } from "lucide-react";

const tabs = [
  { to: "/app/flow", label: "Flowchart", icon: Network },
  { to: "/app/impacts", label: "Impacts", icon: BarChart3 },
  { to: "/app/debate", label: "Debate", icon: MessagesSquare },
];

export function AppTabs() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="border-b border-white/5">
      <div className="mx-auto flex max-w-[1400px] items-center gap-1 px-4 sm:px-6">
        {tabs.map((t) => {
          const active = path === t.to || (t.to === "/app/flow" && path === "/app");
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm transition ${
                active ? "tab-active" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
