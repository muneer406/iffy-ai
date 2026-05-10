import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Bookmark, Compass, Users, User, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/marketplace", label: "Marketplace", icon: Compass },
  { to: "/community", label: "Community", icon: Users },
];

export function Navbar({ scenarioTitle }: { scenarioTitle?: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const showBack = path !== "/";

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050816]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => router.history.back()}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-sky-400/40 hover:text-white"
              aria-label="Go back"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          <Logo />
          {scenarioTitle && (
            <>
              <span className="hidden h-4 w-px bg-white/10 sm:block" />
              <span className="hidden truncate text-sm text-slate-300 sm:inline-block max-w-[28ch]">
                {scenarioTitle}
              </span>
            </>
          )}
        </div>
        <nav className="flex items-center gap-1">
          {links.map((l) => {
            const active = path.startsWith(l.to);
            const Icon = l.icon;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`group inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition ${
                  active ? "bg-white/5 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{l.label}</span>
              </Link>
            );
          })}
          {email ? (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.navigate({ to: "/" });
              }}
              className="ml-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white hover:bg-white/10"
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline max-w-[14ch] truncate">{email}</span>
            </button>
          ) : (
            <Link
              to="/auth"
              className="ml-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white hover:bg-white/10"
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign in</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
