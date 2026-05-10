import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Particles } from "@/components/Particles";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — iffy.ai" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/app/flow" });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app/flow" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setInfo(null); setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/app/flow` },
        });
        if (error) throw error;
        setInfo("Check your inbox to confirm your email, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/app/flow` },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="bg-app relative min-h-screen overflow-hidden">
      <div className="bg-grid absolute inset-0 opacity-30" />
      <Particles count={25} />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6">
        <Logo size="md" />
        <div className="relative mt-6 w-full">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-sky-500/30 to-violet-500/30 opacity-60 blur-2xl" />
          <div className="relative rounded-2xl border border-white/10 bg-[#0F172A]/80 p-6 backdrop-blur-xl">
            <div className="text-center">
              <h1 className="text-xl font-semibold text-white">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
              <p className="mt-1 text-sm text-slate-400">
                {mode === "login" ? "Sign in to continue exploring." : "Start simulating possible futures."}
              </p>
            </div>

            <button
              type="button"
              onClick={google}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-white hover:bg-white/10"
            >
              <GoogleIcon /> Continue with Google
            </button>

            <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-wider text-slate-500">
              <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
            </div>

            <form className="space-y-3" onSubmit={submit}>
              <Field icon={Mail} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@futurist.ai" />
              <Field icon={Lock} type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              <button type="submit" disabled={loading} className="btn-glow inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm disabled:opacity-60">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (<>{mode === "login" ? "Sign in" : "Create account"} <ArrowRight className="h-4 w-4" /></>)}
              </button>
            </form>

            {error && <div className="mt-3 rounded-lg border border-rose-400/30 bg-rose-400/10 p-2 text-xs text-rose-200">{error}</div>}
            {info && <div className="mt-3 rounded-lg border border-sky-400/30 bg-sky-400/10 p-2 text-xs text-sky-200">{info}</div>}

            <div className="mt-4 text-center text-xs text-slate-400">
              {mode === "login" ? "No account? " : "Already have one? "}
              <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setInfo(null); }} className="text-sky-300 hover:text-sky-200">
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ElementType }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        {...props}
        className="w-full rounded-xl border border-white/10 bg-[#080d1c]/80 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-sky-400/40"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#fff" d="M21.35 11.1H12v2.85h5.35c-.23 1.5-1.7 4.4-5.35 4.4-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.62 3.95 14.55 3 12 3 6.92 3 2.8 7.07 2.8 12s4.12 9 9.2 9c5.31 0 8.83-3.73 8.83-8.97 0-.6-.07-1.06-.18-1.93z"/></svg>
  );
}
