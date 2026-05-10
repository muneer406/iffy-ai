import { Link } from "@tanstack/react-router";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";
  return (
    <Link to="/" className="group inline-flex items-center gap-2">
      <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-violet-500 shadow-[0_0_20px_-2px_rgba(99,102,241,0.7)]">
        <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-sky-400 to-violet-500 blur-md opacity-60 group-hover:opacity-90 transition" />
        <span className="relative font-bold text-white text-xs tracking-tight">if</span>
      </span>
      <span className={`font-semibold tracking-tight ${text}`}>
        iffy<span className="text-gradient">.ai</span>
      </span>
    </Link>
  );
}
