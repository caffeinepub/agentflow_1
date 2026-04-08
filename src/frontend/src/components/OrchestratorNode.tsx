import { Brain, Cpu } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { AGENT_LABELS } from "../lib/flowUtils";
import { useFlowStore } from "../store/flowStore";

interface Props {
  isActive: boolean;
  isPulsing: boolean;
  onClick: () => void;
}

const RING_ANGLES = [0, 60, 120, 180, 240, 300];

export function OrchestratorNode({ isActive, isPulsing, onClick }: Props) {
  const { selectedAgent, flowStatus } = useFlowStore();
  const isAnimating = flowStatus !== "idle" && flowStatus !== "complete";

  return (
    <motion.div
      className="absolute"
      style={{ left: "50%", top: "42%", transform: "translate(-50%, -50%)" }}
      data-ocid="node-orchestrator"
    >
      {/* Outer orbit ring */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "-28px",
          border: "1px solid oklch(0.75 0.15 280 / 0.25)",
          borderRadius: "50%",
        }}
        animate={isAnimating ? { rotate: 360 } : { rotate: 0 }}
        transition={{
          duration: 8,
          repeat: isAnimating ? Number.POSITIVE_INFINITY : 0,
          ease: "linear",
        }}
      >
        {/* Orbit dots */}
        {RING_ANGLES.map((angle) => (
          <div
            key={angle}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background:
                angle % 120 === 0
                  ? "oklch(0.75 0.15 280 / 0.8)"
                  : "oklch(0.75 0.15 280 / 0.3)",
              top: `${50 - 50 * Math.cos((angle * Math.PI) / 180)}%`,
              left: `${50 + 50 * Math.sin((angle * Math.PI) / 180)}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </motion.div>

      {/* Inner spin ring */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "-14px",
          border: "1px dashed oklch(0.75 0.15 280 / 0.35)",
          borderRadius: "50%",
        }}
        animate={isAnimating ? { rotate: -360 } : { rotate: 0 }}
        transition={{
          duration: 4,
          repeat: isAnimating ? Number.POSITIVE_INFINITY : 0,
          ease: "linear",
        }}
      />

      {/* Glow halo */}
      <AnimatePresence>
        {(isActive || isPulsing) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            className="absolute rounded-full glow-orchestrator pointer-events-none"
            style={{ inset: "-28px", borderRadius: "50%" }}
          />
        )}
      </AnimatePresence>

      {/* Pulse ring */}
      {isPulsing && (
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeOut",
          }}
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: "-20px",
            border: "1px solid oklch(0.75 0.15 280 / 0.6)",
            borderRadius: "50%",
          }}
        />
      )}

      {/* Main circle */}
      <motion.button
        onClick={onClick}
        animate={isActive || isPulsing ? { scale: 1.05 } : { scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.08 }}
        className="relative w-32 h-32 rounded-full border-2 flex flex-col items-center justify-center gap-1 cursor-pointer"
        style={{
          background:
            "radial-gradient(circle at 40% 35%, oklch(0.25 0.06 280), oklch(0.10 0.01 280))",
          borderColor:
            isActive || isPulsing
              ? "oklch(0.75 0.15 280 / 0.95)"
              : "oklch(0.75 0.15 280 / 0.40)",
          boxShadow:
            isActive || isPulsing
              ? "inset 0 0 20px oklch(0.75 0.15 280 / 0.15)"
              : "none",
        }}
      >
        {/* Animated brain/cpu icon */}
        <motion.div
          animate={isAnimating ? { rotate: [0, 10, -10, 0] } : { rotate: 0 }}
          transition={{
            duration: 2,
            repeat: isAnimating ? Number.POSITIVE_INFINITY : 0,
            ease: "easeInOut",
          }}
        >
          {isAnimating ? (
            <Cpu
              className="w-6 h-6"
              style={{ color: "oklch(0.75 0.15 280)" }}
            />
          ) : (
            <Brain
              className="w-6 h-6"
              style={{ color: "oklch(0.75 0.15 280)" }}
            />
          )}
        </motion.div>

        <span className="text-[11px] font-display font-bold text-foreground leading-tight text-center px-1">
          AI Orchestrator
        </span>

        {/* Routing label — shows active agent */}
        <AnimatePresence mode="wait">
          {isAnimating && selectedAgent ? (
            <motion.span
              key={selectedAgent}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-[8px] font-mono text-center px-1 leading-tight"
              style={{
                color:
                  selectedAgent === "travel"
                    ? "oklch(0.68 0.18 110)"
                    : selectedAgent === "trading"
                      ? "oklch(0.72 0.21 65)"
                      : "oklch(0.55 0.23 20)",
              }}
            >
              → {AGENT_LABELS[selectedAgent]}
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[8px] text-muted-foreground font-mono text-center px-1"
            >
              orchestration platform
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
