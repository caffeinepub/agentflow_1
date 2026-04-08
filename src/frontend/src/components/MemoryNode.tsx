import { Activity, Brain, Clock, Database, Layers } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AGENT_COLORS, AGENT_LABELS } from "../lib/flowUtils";
import { useFlowStore } from "../store/flowStore";
import type { AgentType } from "../types";

interface Props {
  isActive: boolean;
  isPulsing: boolean;
  onClick: () => void;
}

// The small circle node rendered in the flow diagram
export function MemoryNodeCircle({ isActive, isPulsing, onClick }: Props) {
  return (
    <motion.div
      className="absolute"
      style={{ left: "50%", top: "78%", transform: "translate(-50%, -50%)" }}
      data-ocid="node-memory"
    >
      <AnimatePresence>
        {(isActive || isPulsing) && (
          <motion.div
            key="glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute rounded-full glow-memory pointer-events-none"
            style={{ inset: "-16px", borderRadius: "50%" }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isPulsing && (
          <motion.div
            key="pulse"
            initial={{ opacity: 0 }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeOut",
            }}
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: "-10px",
              borderRadius: "50%",
              border: "1px solid oklch(0.50 0.08 180 / 0.6)",
            }}
          />
        )}
      </AnimatePresence>
      <motion.button
        onClick={onClick}
        animate={isActive || isPulsing ? { scale: 1.05 } : { scale: 1 }}
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 0.3 }}
        className="relative w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition-smooth"
        style={{
          background:
            "radial-gradient(circle at 40% 35%, oklch(0.18 0.05 180), oklch(0.10 0.01 180))",
          borderColor:
            isActive || isPulsing
              ? "oklch(0.50 0.08 180 / 0.9)"
              : "oklch(0.50 0.08 180 / 0.3)",
        }}
      >
        <Database
          className="w-4 h-4"
          style={{ color: "oklch(0.50 0.08 180)" }}
        />
        <span className="text-[9px] font-display font-semibold text-foreground leading-tight">
          Memory Store
        </span>
        <span className="text-[8px] text-muted-foreground font-mono">
          Context & flow
        </span>
      </motion.button>
    </motion.div>
  );
}

// The wide bottom panel showing live memory context
export function MemoryNode({ isActive, isPulsing, onClick }: Props) {
  const memoryContext = useFlowStore((s) => s.memoryContext);
  const queryHistory = useFlowStore((s) => s.queryHistory);
  const [justUpdated, setJustUpdated] = useState(false);
  const prevLastUpdated = useRef<number | null>(null);

  // Detect context updates and trigger pulse animation
  useEffect(() => {
    if (!memoryContext) return;
    if (
      prevLastUpdated.current !== null &&
      prevLastUpdated.current !== memoryContext.lastUpdated
    ) {
      setJustUpdated(true);
      const timer = setTimeout(() => setJustUpdated(false), 2000);
      return () => clearTimeout(timer);
    }
    prevLastUpdated.current = memoryContext.lastUpdated;
  }, [memoryContext]);

  const totalQueries =
    memoryContext?.totalQueries ??
    Object.values(queryHistory).reduce((acc, arr) => acc + arr.length, 0);

  const activeAgentTypes = (
    ["travel", "trading", "general"] as AgentType[]
  ).filter(
    (a) => (memoryContext?.agentUsage?.[a] ?? queryHistory[a].length) > 0,
  );

  // Gather last tool calls across all agents
  const lastToolCalls = Object.values(queryHistory)
    .flatMap((records) => records[0]?.toolCalls ?? [])
    .slice(0, 4);

  const timeSinceUpdate = memoryContext
    ? Math.round((Date.now() - memoryContext.lastUpdated) / 1000)
    : null;

  return (
    <motion.div
      className="relative z-10 mx-4 mb-1"
      data-ocid="memory-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.button
        type="button"
        onClick={onClick}
        className="w-full text-left rounded-xl border overflow-hidden transition-smooth"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.11 0.03 180 / 0.95), oklch(0.09 0.01 220 / 0.95))",
          borderColor:
            isActive || isPulsing || justUpdated
              ? "oklch(0.50 0.08 180 / 0.6)"
              : "oklch(0.50 0.08 180 / 0.2)",
          boxShadow:
            isActive || isPulsing || justUpdated
              ? "0 0 20px oklch(0.5 0.08 180 / 0.25), 0 0 40px oklch(0.5 0.08 180 / 0.12), inset 0 1px 0 oklch(0.5 0.08 180 / 0.1)"
              : "0 0 10px oklch(0.5 0.08 180 / 0.1), inset 0 1px 0 oklch(0.5 0.08 180 / 0.05)",
        }}
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.2 }}
      >
        {/* Pulse overlay on update */}
        <AnimatePresence>
          {justUpdated && (
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.15, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ background: "oklch(0.5 0.08 180)" }}
            />
          )}
        </AnimatePresence>

        <div className="relative flex items-center gap-4 px-4 py-2.5">
          {/* Icon + label */}
          <div className="flex items-center gap-2 shrink-0">
            <motion.div
              animate={
                isActive || isPulsing
                  ? { scale: [1, 1.15, 1], opacity: [1, 0.7, 1] }
                  : { scale: 1, opacity: 1 }
              }
              transition={
                isActive || isPulsing
                  ? { duration: 1.5, repeat: Number.POSITIVE_INFINITY }
                  : {}
              }
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: "oklch(0.5 0.08 180 / 0.15)",
                border: "1px solid oklch(0.5 0.08 180 / 0.35)",
              }}
            >
              <Database
                className="w-3.5 h-3.5"
                style={{ color: "oklch(0.65 0.1 180)" }}
              />
            </motion.div>
            <div>
              <p
                className="text-[10px] font-display font-semibold leading-tight"
                style={{ color: "oklch(0.70 0.10 180)" }}
              >
                Memory Store
              </p>
              <p className="text-[8px] font-mono text-muted-foreground leading-tight">
                Shared context
              </p>
            </div>
          </div>

          {/* Divider */}
          <div
            className="w-px h-8 shrink-0"
            style={{ background: "oklch(0.5 0.08 180 / 0.2)" }}
          />

          {/* Total queries */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Layers
              className="w-3 h-3 shrink-0"
              style={{ color: "oklch(0.65 0.1 180)" }}
            />
            <div>
              <p
                className="text-base font-display font-bold leading-none"
                style={{ color: "oklch(0.80 0.12 180)" }}
              >
                {totalQueries}
              </p>
              <p className="text-[8px] font-mono text-muted-foreground">
                queries
              </p>
            </div>
          </div>

          {/* Divider */}
          <div
            className="w-px h-8 shrink-0"
            style={{ background: "oklch(0.5 0.08 180 / 0.2)" }}
          />

          {/* Active agents */}
          <div className="flex items-center gap-2 shrink-0">
            <Activity
              className="w-3 h-3 shrink-0"
              style={{ color: "oklch(0.65 0.1 180)" }}
            />
            <div className="flex items-center gap-1">
              {activeAgentTypes.map((agent) => {
                const color = AGENT_COLORS[agent];
                const count =
                  memoryContext?.agentUsage?.[agent] ??
                  queryHistory[agent].length;
                return (
                  <div
                    key={agent}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-mono font-semibold"
                    style={{
                      background: `${color.replace(")", " / 0.12)")}`,
                      border: `1px solid ${color.replace(")", " / 0.3)")}`,
                      color,
                    }}
                  >
                    <span>{AGENT_LABELS[agent].split(" ")[0]}</span>
                    <span
                      className="opacity-70"
                      style={{ color: "oklch(0.8 0.05 180)" }}
                    >
                      ×{count}
                    </span>
                  </div>
                );
              })}
              {activeAgentTypes.length === 0 && (
                <span className="text-[9px] font-mono text-muted-foreground">
                  no activity yet
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div
            className="w-px h-8 shrink-0"
            style={{ background: "oklch(0.5 0.08 180 / 0.2)" }}
          />

          {/* Last tool calls */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Brain
              className="w-3 h-3 shrink-0"
              style={{ color: "oklch(0.65 0.1 180)" }}
            />
            <div className="flex items-center gap-1 flex-wrap">
              {lastToolCalls.length > 0 ? (
                lastToolCalls.map((tc, i) => (
                  <span
                    key={`${tc.toolName}-${i}`}
                    className="text-[8px] font-mono px-1.5 py-0.5 rounded"
                    style={{
                      background: "oklch(0.5 0.08 180 / 0.08)",
                      border: "1px solid oklch(0.5 0.08 180 / 0.18)",
                      color: "oklch(0.72 0.08 180)",
                    }}
                  >
                    {tc.toolName}
                  </span>
                ))
              ) : (
                <span className="text-[9px] font-mono text-muted-foreground">
                  no tool calls yet
                </span>
              )}
            </div>
          </div>

          {/* Timestamp */}
          {timeSinceUpdate !== null && (
            <div className="flex items-center gap-1 shrink-0">
              <Clock
                className="w-2.5 h-2.5"
                style={{ color: "oklch(0.5 0.06 180)" }}
              />
              <span
                className="text-[8px] font-mono"
                style={{ color: "oklch(0.5 0.06 180)" }}
              >
                {timeSinceUpdate < 60
                  ? `${timeSinceUpdate}s ago`
                  : `${Math.round(timeSinceUpdate / 60)}m ago`}
              </span>
            </div>
          )}

          {/* Live indicator */}
          <div className="flex items-center gap-1 shrink-0">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "oklch(0.65 0.15 160)" }}
            />
            <span
              className="text-[8px] font-mono"
              style={{ color: "oklch(0.55 0.1 160)" }}
            >
              LIVE
            </span>
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}
