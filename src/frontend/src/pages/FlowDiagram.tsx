import { History, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { AgentNode } from "../components/AgentNode";
import { ConnectionLines } from "../components/ConnectionLines";
import { MemoryNode, MemoryNodeCircle } from "../components/MemoryNode";
import { OrchestratorNode } from "../components/OrchestratorNode";
import { QueryHistoryPanel } from "../components/QueryHistoryPanel";
import { QueryInput } from "../components/QueryInput";
import { ResultPanel } from "../components/ResultPanel";
import { StatusBar } from "../components/StatusBar";
import { ToolNode } from "../components/ToolNode";
import { useFlowStore } from "../store/flowStore";
import type { AgentType, NodeId } from "../types";

const AGENT_POSITIONS = {
  travel: { x: 24, y: 14 },
  trading: { x: 68, y: 14 },
  general: { x: 24, y: 62 },
} as const;

const TOOL_POSITIONS = {
  "flight-api": { x: 14, y: 36 },
  "hotel-db": { x: 24, y: 42 },
  "weather-svc": { x: 34, y: 38 },
  "market-feed": { x: 60, y: 36 },
  "order-exec": { x: 70, y: 42 },
  "portfolio-sync": { x: 80, y: 37 },
  "knowledge-base-1": { x: 10, y: 60 },
  "knowledge-base-2": { x: 14, y: 72 },
  "web-search": { x: 24, y: 78 },
  "code-interpreter": { x: 34, y: 73 },
} as const;

// Pre-computed deterministic starfield — module-level const
const STARS = Array.from({ length: 90 }, (_, i) => ({
  id: `star-${i}`,
  size: 1 + (i % 3) * 0.5,
  left: `${((i * 137.508) % 100).toFixed(2)}%`,
  top: `${((i * 97.3) % 100).toFixed(2)}%`,
  opacity: 0.05 + (i % 6) * 0.06,
  twinkle: i % 4 === 0,
  twinkleDuration: 2 + (i % 5),
  twinkleDelay: (i % 7) * 0.6,
}));

export default function FlowDiagram() {
  const [historyAgent, setHistoryAgent] = useState<AgentType | null>(null);

  const {
    flowStatus,
    activeNodes,
    pulsingNodes,
    lastResult,
    selectedNode,
    setSelectedNode,
  } = useFlowStore();

  const handleNodeClick = useCallback(
    (nodeId: NodeId) => {
      if (selectedNode === nodeId) {
        setSelectedNode(null);
      } else {
        setSelectedNode(nodeId);
        const agentNodes: AgentType[] = ["travel", "trading", "general"];
        if (agentNodes.includes(nodeId as AgentType)) {
          setHistoryAgent(nodeId as AgentType);
        }
      }
    },
    [selectedNode, setSelectedNode],
  );

  const isNodeActive = (id: NodeId) => activeNodes.has(id);
  const isNodePulsing = (id: NodeId) => pulsingNodes.has(id);
  const isFlowing = flowStatus === "routing" || flowStatus === "executing";

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-background flex flex-col"
      data-ocid="flow-diagram"
    >
      {/* Header */}
      <header
        className="relative z-20 flex items-center justify-between px-5 py-2.5 border-b shrink-0"
        style={{
          background: "oklch(0.11 0.01 280 / 0.97)",
          borderColor: "oklch(0.22 0.02 280 / 0.5)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={
              isFlowing
                ? {
                    boxShadow: [
                      "0 0 0px oklch(0.75 0.15 280 / 0)",
                      "0 0 8px oklch(0.75 0.15 280 / 0.6)",
                      "0 0 0px oklch(0.75 0.15 280 / 0)",
                    ],
                  }
                : { boxShadow: "0 0 0px oklch(0.75 0.15 280 / 0)" }
            }
            transition={{
              duration: 1.6,
              repeat: isFlowing ? Number.POSITIVE_INFINITY : 0,
            }}
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "oklch(0.18 0.04 280)",
              border: "1px solid oklch(0.75 0.15 280 / 0.4)",
            }}
          >
            <Zap
              className="w-3.5 h-3.5"
              style={{ color: "oklch(0.75 0.15 280)" }}
            />
          </motion.div>
          <div>
            <h1 className="text-sm font-display font-bold text-foreground tracking-wide leading-none">
              AI Orchestration Flow
            </h1>
            <p className="text-[9px] text-muted-foreground font-mono mt-0.5 leading-none">
              Digital orchestration platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBar />
          <button
            type="button"
            data-ocid="history-toggle"
            onClick={() => setHistoryAgent(historyAgent ? null : "general")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono transition-smooth"
            style={{
              color: historyAgent
                ? "oklch(0.75 0.15 280)"
                : "oklch(0.55 0.03 280)",
              background: historyAgent
                ? "oklch(0.75 0.15 280 / 0.1)"
                : "transparent",
              border: `1px solid ${historyAgent ? "oklch(0.75 0.15 280 / 0.4)" : "oklch(0.22 0.02 280 / 0.6)"}`,
            }}
          >
            <History className="w-3 h-3" />
            History
          </button>
        </div>
      </header>

      {/* Main canvas */}
      <div className="relative flex-1 overflow-hidden min-h-0">
        {/* Starfield */}
        <div className="absolute inset-0 pointer-events-none">
          {STARS.map((star) => (
            <motion.div
              key={star.id}
              className="absolute rounded-full"
              style={{
                width: star.size,
                height: star.size,
                left: star.left,
                top: star.top,
                background: "oklch(0.85 0.02 280)",
                opacity: star.opacity,
              }}
              animate={
                star.twinkle
                  ? { opacity: [star.opacity, star.opacity * 4, star.opacity] }
                  : undefined
              }
              transition={
                star.twinkle
                  ? {
                      duration: star.twinkleDuration,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: star.twinkleDelay,
                    }
                  : undefined
              }
            />
          ))}
        </div>

        {/* Central radial glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 50% at 50% 42%, oklch(0.75 0.15 280 / 0.04) 0%, transparent 70%)",
          }}
        />

        {/* SVG Connection Lines with animated particles */}
        <ConnectionLines
          activeNodes={activeNodes}
          pulsingNodes={pulsingNodes}
        />

        {/* Orchestrator — center */}
        <OrchestratorNode
          isActive={isNodeActive("orchestrator")}
          isPulsing={isNodePulsing("orchestrator")}
          onClick={() => handleNodeClick("orchestrator")}
        />

        {/* Memory circle node — bottom center of canvas */}
        <MemoryNodeCircle
          isActive={isNodeActive("memory")}
          isPulsing={isNodePulsing("memory")}
          onClick={() => handleNodeClick("memory")}
        />

        {/* Agent Nodes */}
        {(["travel", "trading", "general"] as AgentType[]).map((agent) => (
          <AgentNode
            key={agent}
            agentType={agent}
            position={AGENT_POSITIONS[agent]}
            isActive={isNodeActive(agent)}
            isPulsing={isNodePulsing(agent)}
            onClick={() => handleNodeClick(agent)}
          />
        ))}

        {/* Tool Nodes */}
        {Object.entries(TOOL_POSITIONS).map(([id, pos]) => (
          <ToolNode
            key={id}
            nodeId={id as NodeId}
            position={pos}
            isActive={isNodeActive(id as NodeId)}
            isPulsing={isNodePulsing(id as NodeId)}
            onClick={() => handleNodeClick(id as NodeId)}
          />
        ))}

        {/* Flow status overlay */}
        <AnimatePresence>
          {isFlowing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
            >
              <div
                className="px-3 py-1.5 rounded-full text-[10px] font-mono flex items-center gap-2"
                style={{
                  background: "oklch(0.12 0.02 280 / 0.92)",
                  border: "1px solid oklch(0.75 0.15 280 / 0.35)",
                  color: "oklch(0.80 0.12 280)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
                  transition={{
                    duration: 0.8,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "oklch(0.75 0.15 280)" }}
                />
                {flowStatus === "routing"
                  ? "Routing query to agent…"
                  : "Agent executing tools…"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Memory context bar */}
      <MemoryNode
        isActive={isNodeActive("memory")}
        isPulsing={isNodePulsing("memory")}
        onClick={() => handleNodeClick("memory")}
      />

      {/* Query Input */}
      <div
        className="relative z-20 shrink-0"
        style={{
          background:
            "linear-gradient(to top, oklch(0.08 0.01 280) 60%, oklch(0.08 0.01 280 / 0.0))",
        }}
      >
        <QueryInput />
      </div>

      {/* Result Panel */}
      <AnimatePresence>
        {lastResult && flowStatus === "complete" && (
          <ResultPanel
            result={lastResult}
            onClose={() => useFlowStore.getState().resetFlow()}
          />
        )}
      </AnimatePresence>

      {/* History Panel */}
      <AnimatePresence>
        {historyAgent && (
          <QueryHistoryPanel
            agentType={historyAgent}
            onClose={() => setHistoryAgent(null)}
            onAgentChange={setHistoryAgent}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
