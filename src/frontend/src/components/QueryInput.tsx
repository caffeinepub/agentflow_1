import { Send, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { useAgentFlow } from "../hooks/useAgentFlow";
import { useFlowStore } from "../store/flowStore";

const PLACEHOLDER_EXAMPLES = [
  "Find me flights from NYC to Tokyo next month",
  "What is the current Bitcoin price and trend?",
  "Explain how transformer models work",
  "Best hotels in Paris under $150/night",
  "Should I rebalance my portfolio toward tech stocks?",
];

export function QueryInput() {
  const [inputValue, setInputValue] = useState("");
  const [placeholderIdx] = useState(() =>
    Math.floor(Math.random() * PLACEHOLDER_EXAMPLES.length),
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const { flowStatus } = useFlowStore();
  const { submitQuery, cancelFlow } = useAgentFlow();

  const isActive = flowStatus !== "idle" && flowStatus !== "complete";
  const isComplete = flowStatus === "complete";

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue.trim() || isActive) return;
      const query = inputValue.trim();
      setInputValue("");
      await submitQuery(query);
    },
    [inputValue, isActive, submitQuery],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e as unknown as React.FormEvent);
    }
  };

  // Detect likely agent type for hint
  const lowerVal = inputValue.toLowerCase();
  const agentHint = [
    "flight",
    "hotel",
    "travel",
    "trip",
    "vacation",
    "airline",
  ].some((k) => lowerVal.includes(k))
    ? { label: "Travel Agent", color: "oklch(0.68 0.18 110)" }
    : [
          "stock",
          "trade",
          "market",
          "bitcoin",
          "crypto",
          "portfolio",
          "invest",
        ].some((k) => lowerVal.includes(k))
      ? { label: "Trading Agent", color: "oklch(0.72 0.21 65)" }
      : inputValue.length > 4
        ? { label: "General Agent", color: "oklch(0.55 0.23 20)" }
        : null;

  return (
    <div className="relative z-20 px-6 pb-5 pt-2">
      {/* Glassmorphism container */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <motion.div
            animate={
              isActive
                ? {
                    boxShadow: [
                      "0 0 0 1px oklch(0.75 0.15 280 / 0.3)",
                      "0 0 12px oklch(0.75 0.15 280 / 0.5)",
                      "0 0 0 1px oklch(0.75 0.15 280 / 0.3)",
                    ],
                  }
                : { boxShadow: "0 0 0 1px oklch(0.75 0.15 280 / 0.15)" }
            }
            transition={{
              duration: 1.8,
              repeat: isActive ? Number.POSITIVE_INFINITY : 0,
              ease: "easeInOut",
            }}
            className="relative flex items-center gap-3 rounded-2xl px-4 py-3 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.14 0.02 280 / 0.92), oklch(0.10 0.01 280 / 0.96))",
              backdropFilter: "blur(20px)",
              border: "1px solid oklch(0.28 0.03 280 / 0.5)",
            }}
          >
            {/* Subtle shimmer line on top */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.75 0.15 280 / 0.4), transparent)",
              }}
            />

            {/* Sparkle icon */}
            <motion.div
              animate={
                isActive
                  ? { rotate: [0, 180, 360], opacity: [0.6, 1, 0.6] }
                  : { rotate: 0, opacity: 0.4 }
              }
              transition={{
                duration: 2,
                repeat: isActive ? Number.POSITIVE_INFINITY : 0,
                ease: "linear",
              }}
              className="shrink-0"
            >
              <Sparkles
                className="w-4 h-4"
                style={{ color: "oklch(0.75 0.15 280 / 0.7)" }}
              />
            </motion.div>

            {/* Input field */}
            <input
              ref={inputRef}
              data-ocid="query-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={PLACEHOLDER_EXAMPLES[placeholderIdx]}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none font-body min-w-0"
              disabled={isActive}
              aria-label="Ask the AI orchestrator a question"
            />

            {/* Agent hint badge */}
            <AnimatePresence>
              {agentHint && !isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 8 }}
                  className="shrink-0 text-[9px] font-mono px-2 py-0.5 rounded-full"
                  style={{
                    color: agentHint.color,
                    background: `${agentHint.color.replace(")", " / 0.12)")}`,
                    border: `1px solid ${agentHint.color.replace(")", " / 0.3)")}`,
                  }}
                >
                  {agentHint.label}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit / Cancel button */}
            <AnimatePresence mode="wait">
              {isActive ? (
                <motion.button
                  key="cancel"
                  initial={{ opacity: 0, scale: 0.7, rotate: -90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.7, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  type="button"
                  onClick={cancelFlow}
                  data-ocid="cancel-btn"
                  aria-label="Cancel query"
                  className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-smooth"
                  style={{
                    background: "oklch(0.55 0.23 20 / 0.15)",
                    border: "1px solid oklch(0.55 0.23 20 / 0.4)",
                    color: "oklch(0.55 0.23 20)",
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              ) : (
                <motion.button
                  key="submit"
                  initial={{ opacity: 0, scale: 0.7, rotate: 90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.7, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                  type="submit"
                  disabled={!inputValue.trim() || isActive}
                  data-ocid="submit-btn"
                  aria-label="Submit query"
                  whileHover={inputValue.trim() ? { scale: 1.1 } : undefined}
                  whileTap={inputValue.trim() ? { scale: 0.95 } : undefined}
                  className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-smooth disabled:opacity-25 disabled:cursor-not-allowed"
                  style={{
                    background: inputValue.trim()
                      ? "oklch(0.75 0.15 280 / 0.2)"
                      : "oklch(0.75 0.15 280 / 0.05)",
                    border: `1px solid oklch(0.75 0.15 280 / ${inputValue.trim() ? "0.5" : "0.2"})`,
                    color: "oklch(0.75 0.15 280)",
                  }}
                >
                  <Send className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </form>

        {/* Sub-hint row */}
        <motion.p
          animate={isComplete ? { opacity: 1 } : { opacity: 0.45 }}
          className="text-center text-[10px] text-muted-foreground mt-1.5 font-mono"
        >
          {isComplete
            ? "✓ Query complete — ask a follow-up or try a new topic"
            : "Auto-routes to Travel · Trading · General agents"}
        </motion.p>
      </div>
    </div>
  );
}
