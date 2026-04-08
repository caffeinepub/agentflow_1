import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { NodeId } from "../types";

interface Props {
  nodeId: NodeId;
  position: { x: number; y: number };
  isActive: boolean;
  isPulsing: boolean;
  onClick: () => void;
}

const TOOL_CONFIG: Record<
  string,
  { label: string; color: string; outputSnippets: string[] }
> = {
  "flight-api": {
    label: "Flight API",
    color: "oklch(0.68 0.18 110)",
    outputSnippets: [
      "12 flights found",
      "Best: $389 JFK→NRT",
      "6h avg delay: 0",
    ],
  },
  "hotel-db": {
    label: "Hotel DB",
    color: "oklch(0.68 0.18 110)",
    outputSnippets: ["8 hotels matched", "From $89/night", "4.8★ avg rating"],
  },
  "weather-svc": {
    label: "Weather",
    color: "oklch(0.68 0.18 110)",
    outputSnippets: [
      "24°C clear skies",
      "5-day forecast ready",
      "0% rain chance",
    ],
  },
  "market-feed": {
    label: "Market Feed",
    color: "oklch(0.72 0.21 65)",
    outputSnippets: [
      "BTC $67,420 +2.3%",
      "Live prices loaded",
      "Vol +34% vs avg",
    ],
  },
  "order-exec": {
    label: "Order Exec",
    color: "oklch(0.72 0.21 65)",
    outputSnippets: ["TWAP strategy set", "Slippage: 0.12%", "Order queued"],
  },
  "portfolio-sync": {
    label: "Portfolio",
    color: "oklch(0.72 0.21 65)",
    outputSnippets: ["28% tech allocated", "Sync complete", "P&L: +$1,240"],
  },
  "knowledge-base-1": {
    label: "Knowledge",
    color: "oklch(0.55 0.23 20)",
    outputSnippets: [
      "47 docs retrieved",
      "Confidence: 94%",
      "3 domains covered",
    ],
  },
  "knowledge-base-2": {
    label: "Knowledge",
    color: "oklch(0.55 0.23 20)",
    outputSnippets: [
      "23 papers found",
      "Context loaded",
      "Semantic match: 0.91",
    ],
  },
  "web-search": {
    label: "Web Search",
    color: "oklch(0.55 0.23 20)",
    outputSnippets: ["8 sources found", "DuckDuckGo OK", "Top result ranked"],
  },
  "code-interpreter": {
    label: "Code Run",
    color: "oklch(0.55 0.23 20)",
    outputSnippets: ["Tests: 3/3 pass", "Output: 0.97ms", "No exceptions"],
  },
};

const FALLBACK = {
  label: "Tool",
  color: "oklch(0.65 0.05 280)",
  outputSnippets: ["Data ready"],
};

export function ToolNode({
  nodeId,
  position,
  isActive,
  isPulsing,
  onClick,
}: Props) {
  const config = TOOL_CONFIG[nodeId] ?? FALLBACK;
  const highlighted = isActive || isPulsing;

  // Cycle through output snippets when active
  const [snippetIdx, setSnippetIdx] = useState(0);
  const [showSnippet, setShowSnippet] = useState(false);

  useEffect(() => {
    if (isPulsing) {
      setSnippetIdx((prev) => (prev + 1) % config.outputSnippets.length);
      setShowSnippet(true);
      const t = setTimeout(() => setShowSnippet(false), 2200);
      return () => clearTimeout(t);
    }
    if (!highlighted) {
      setShowSnippet(false);
    }
  }, [isPulsing, highlighted, config.outputSnippets.length]);

  const dimColor = config.color.replace(")", " / 0.25)");
  const bgColor = config.color.replace(")", " / 0.10)");

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: highlighted ? 15 : 8,
      }}
      data-ocid={`node-tool-${nodeId}`}
    >
      {/* Glow halo */}
      <AnimatePresence>
        {highlighted && (
          <motion.div
            key="halo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: "-8px",
              borderRadius: "50%",
              boxShadow: `0 0 14px ${config.color.replace(")", " / 0.55)")}, 0 0 28px ${config.color.replace(")", " / 0.20)")}`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Pulse ring */}
      <AnimatePresence>
        {isPulsing && (
          <motion.div
            key="pulse"
            animate={{ scale: [1, 1.65, 1], opacity: [0.5, 0, 0.5] }}
            transition={{
              duration: 1.05,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeOut",
            }}
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: "-6px",
              borderRadius: "50%",
              border: `1.5px solid ${config.color}`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Pill button */}
      <motion.button
        type="button"
        onClick={onClick}
        animate={highlighted ? { scale: 1.1 } : { scale: 1 }}
        whileHover={{ scale: highlighted ? 1.14 : 1.08 }}
        transition={{ duration: 0.22 }}
        className="relative flex items-center justify-center cursor-pointer rounded-full"
        style={{
          width: "62px",
          height: "62px",
          background: highlighted
            ? `radial-gradient(circle, ${bgColor}, oklch(0.10 0.01 280))`
            : "radial-gradient(circle, oklch(0.13 0.01 280), oklch(0.09 0.01 280))",
          border: `1.5px solid ${highlighted ? config.color : dimColor}`,
        }}
        aria-label={config.label}
      >
        <span
          className="text-[8px] font-display font-semibold text-center leading-tight px-1 select-none"
          style={{
            color: highlighted ? config.color : "oklch(0.58 0.03 280)",
          }}
        >
          {config.label}
        </span>
      </motion.button>

      {/* Output snippet toast — floats above the node when tool fires */}
      <AnimatePresence>
        {showSnippet && (
          <motion.div
            key="snippet"
            initial={{ opacity: 0, y: 6, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.9 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-1/2 pointer-events-none z-30"
            style={{
              bottom: "calc(100% + 8px)",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
            }}
          >
            <div
              className="px-2 py-1 rounded-md text-[8px] font-mono font-semibold shadow-lg"
              style={{
                color: config.color,
                background: "oklch(0.10 0.01 280 / 0.92)",
                border: `1px solid ${config.color.replace(")", " / 0.35)")}`,
                backdropFilter: "blur(6px)",
              }}
            >
              ✓ {config.outputSnippets[snippetIdx]}
            </div>
            {/* Caret */}
            <div
              className="absolute left-1/2 top-full w-0 h-0 pointer-events-none"
              style={{
                transform: "translateX(-50%)",
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderTop: `4px solid ${config.color.replace(")", " / 0.35)")}`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
