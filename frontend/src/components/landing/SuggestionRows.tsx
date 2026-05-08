"use client";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const SUGGESTIONS = [
  "AI replaces all junior software engineers",
  "Countries remove income tax entirely",
  "Social media platforms shut down globally",
  "College degrees stop mattering for jobs",
  "Cars become fully autonomous overnight",
  "Robots take over all manufacturing jobs",
  "Universal basic income is implemented worldwide",
  "The internet shuts down for a week",
  "Schools shift to fully project-based learning",
  "Fossil fuels are banned immediately",
  "Everyone works remotely permanently",
  "Cryptocurrencies replace national currencies",
  "Humans achieve indefinite life extension",
  "Space colonization becomes affordable",
  "All social media likes disappear",
  "Governments ban smartphones for under-18s",
  "Open-source AI surpasses all proprietary models",
  "Cities ban private car ownership",
  "Genetic engineering of humans becomes legal",
  "News media is 100% AI-generated",
];

const ROW1 = SUGGESTIONS.slice(0, 10);
const ROW2 = SUGGESTIONS.slice(10, 20);
const ROW3 = [...SUGGESTIONS.slice(5, 12), ...SUGGESTIONS.slice(0, 5)];

function ScrollRow({
  items,
  direction = 1,
  speed = 40,
}: {
  items: string[];
  direction?: 1 | -1;
  speed?: number;
}) {
  const doubled = [...items, ...items];
  const duration = items.length * speed * 0.1;

  return (
    <div className="overflow-hidden py-1.5 mask-fade-x">
      <motion.div
        className="flex gap-3 w-max"
        animate={{ x: direction > 0 ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            className="
              shrink-0 px-4 py-2 rounded-full text-sm font-medium
              border border-white/8 bg-white/3
              text-slate-400 hover:text-slate-200 hover:border-blue-500/40
              hover:bg-blue-500/8 transition-all duration-300 cursor-pointer
              whitespace-nowrap select-none
            "
          >
            What if… {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function SuggestionRows({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="w-full space-y-2 relative">
      {/* Horizontal fade masks */}
      <style>{`
        .mask-fade-x {
          mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
        }
      `}</style>
      <ScrollRow items={ROW1} direction={1} speed={50} />
      <ScrollRow items={ROW2} direction={-1} speed={60} />
      <ScrollRow items={ROW3} direction={1} speed={45} />
    </div>
  );
}
