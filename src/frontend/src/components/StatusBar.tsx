import { AnimatePresence, motion } from "motion/react";
import { useFlowStore } from "../store/flowStore";
import type { FlowStatus } from "../types";

const STATUS_CONFIG: Record<
  FlowStatus,
  { label: string; color: string; pulse: boolean; dotColor: string }
> = {
  idle: {
    label: "Ready",
    color: "oklch(0.55 0.05 280)",
    dotColor: "oklch(0.45 0.03 280)",
    pulse: false,
  },
  routing: {
    label: "Routing query…",
    color: "oklch(0.75 0.15 280)",
    dotColor: "oklch(0.75 0.15 280)",
    pulse: true,
  },
  executing: {
    label: "Executing…",
    color: "oklch(0.68 0.18 110)",
    dotColor: "oklch(0.68 0.18 110)",
    pulse: true,
  },
  storing: {
    label: "Storing context…",
    color: "oklch(0.50 0.08 180)",
    dotColor: "oklch(0.60 0.10 180)",
    pulse: true,
  },
  complete: {
    label: "Complete",
    color: "oklch(0.68 0.18 110)",
    dotColor: "oklch(0.68 0.18 110)",
    pulse: false,
  },
  error: {
    label: "Error",
    color: "oklch(0.55 0.23 20)",
    dotColor: "oklch(0.65 0.23 20)",
    pulse: false,
  },
};

export function StatusBar() {
  const { flowStatus, flowSteps, currentStepIndex } = useFlowStore();
  const config = STATUS_CONFIG[flowStatus];
  const progress =
    flowSteps.length > 0 ? (currentStepIndex / flowSteps.length) * 100 : 0;
  const currentStep = flowSteps[currentStepIndex];

  return (
    <div className="flex items-center gap-3" data-ocid="status-bar">
      {/* Status dot + label */}
      <div className="flex items-center gap-1.5">
        <motion.div
          animate={
            config.pulse
              ? { scale: [1, 1.6, 1], opacity: [1, 0.3, 1] }
              : { scale: 1, opacity: 1 }
          }
          transition={{
            duration: 0.9,
            repeat: config.pulse ? Number.POSITIVE_INFINITY : 0,
            ease: "easeInOut",
          }}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: config.dotColor }}
        />
        <span
          className="text-[10px] font-mono tabular-nums"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      </div>

      {/* Current step label */}
      <AnimatePresence mode="wait">
        {flowStatus !== "idle" && currentStep && (
          <motion.span
            key={currentStep.label}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="text-[10px] font-mono text-muted-foreground hidden sm:block truncate max-w-36"
          >
            {currentStep.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      {flowStatus !== "idle" && flowSteps.length > 0 && (
        <div className="w-20 h-0.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: config.color }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      )}
    </div>
  );
}
