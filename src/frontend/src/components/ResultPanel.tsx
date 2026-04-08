import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AGENT_COLORS, AGENT_LABELS } from "../lib/flowUtils";
import type { AgentType, QueryResult, ToolCall } from "../types";

interface Props {
  result: QueryResult;
  onClose: () => void;
}

const TOOL_ICONS: Record<string, React.ReactNode> = {
  FlightAPI: <Activity className="w-3 h-3" />,
  HotelDatabase: <CheckCircle2 className="w-3 h-3" />,
  WeatherService: <Zap className="w-3 h-3" />,
  MarketFeed: <Activity className="w-3 h-3" />,
  OrderExecution: <CheckCircle2 className="w-3 h-3" />,
  PortfolioSync: <Zap className="w-3 h-3" />,
  KnowledgeBase: <CheckCircle2 className="w-3 h-3" />,
  WebSearch: <Activity className="w-3 h-3" />,
  CodeInterpreter: <Code2 className="w-3 h-3" />,
};

function ToolCallRow({ tool, color }: { tool: ToolCall; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between px-3 py-2 rounded-lg"
      style={{
        background: `${color.replace(")", " / 0.07)")}`,
        border: `1px solid ${color.replace(")", " / 0.18)")}`,
      }}
      data-ocid={`tool-row-${tool.toolName.toLowerCase()}`}
    >
      <div className="flex items-center gap-2">
        <div style={{ color }}>
          {TOOL_ICONS[tool.toolName] ?? <CheckCircle2 className="w-3 h-3" />}
        </div>
        <div>
          <p className="text-[11px] font-mono font-semibold" style={{ color }}>
            {tool.toolName}
          </p>
          <p className="text-[9px] text-muted-foreground font-mono truncate max-w-[180px]">
            → {tool.output}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Clock className="w-2.5 h-2.5" />
        <span className="text-[9px] font-mono">{tool.durationMs}ms</span>
      </div>
    </motion.div>
  );
}

function AgentBadge({ agentType }: { agentType: AgentType }) {
  const color = AGENT_COLORS[agentType];
  const label = AGENT_LABELS[agentType];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold"
      style={{
        background: `${color.replace(")", " / 0.15)")}`,
        border: `1px solid ${color.replace(")", " / 0.4)")}`,
        color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 4px ${color}` }}
      />
      {label}
    </span>
  );
}

export function ResultPanel({ result, onClose }: Props) {
  const [showRaw, setShowRaw] = useState(false);
  const color = AGENT_COLORS[result.agentType];

  const rawSnippet = JSON.stringify(
    {
      id: result.id,
      agent: result.agentType,
      confidence: result.confidence.toFixed(3),
      duration_ms: result.durationMs,
      tools_called: result.toolCalls.map((t) => t.toolName),
      response_preview: `${result.response.slice(0, 120)}…`,
    },
    null,
    2,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 80, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.97 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl"
      data-ocid="result-panel"
    >
      {/* Ambient glow behind panel */}
      <div
        className="absolute inset-x-8 -inset-y-2 rounded-2xl pointer-events-none blur-2xl opacity-20"
        style={{ background: color }}
      />

      <div
        className="relative mx-4 rounded-2xl border overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.13 0.015 280) 0%, oklch(0.10 0.01 280) 100%)",
          borderColor: color.replace(")", " / 0.35)"),
          boxShadow: `0 4px 32px oklch(0 0 0 / 0.6), 0 0 0 1px ${color.replace(")", " / 0.1)")}`,
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Accent stripe */}
        <div
          className="h-0.5 w-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <AgentBadge agentType={result.agentType} />
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono"
              style={{
                background: "oklch(0.75 0.15 280 / 0.1)",
                border: "1px solid oklch(0.75 0.15 280 / 0.2)",
                color: "oklch(0.75 0.15 280)",
              }}
            >
              <span>{Math.round(result.confidence * 100)}%</span>
              <span className="opacity-60">confidence</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span className="text-[10px] font-mono">
                {(result.durationMs / 1000).toFixed(2)}s
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-smooth"
              data-ocid="close-result"
              aria-label="Close result panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Response body */}
        <div
          className="mx-4 mb-3 rounded-xl px-4 py-3"
          style={{
            background: `${color.replace(")", " / 0.05)")}`,
            border: `1px solid ${color.replace(")", " / 0.12)")}`,
          }}
        >
          <p className="text-sm text-foreground/90 font-body leading-relaxed">
            {result.response}
          </p>
        </div>

        {/* Tool calls */}
        {result.toolCalls.length > 0 && (
          <div className="px-4 mb-3">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
              Tools Invoked · {result.toolCalls.length}
            </p>
            <div className="flex flex-col gap-1.5">
              {result.toolCalls.map((tool, i) => (
                <motion.div
                  key={tool.toolName}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <ToolCallRow tool={tool} color={color} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Raw API response toggle */}
        <div className="px-4 pb-3">
          <button
            type="button"
            onClick={() => setShowRaw((v) => !v)}
            className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-smooth mb-2"
            data-ocid="toggle-raw-response"
          >
            <Code2 className="w-3 h-3" />
            <span>Raw API Response</span>
            {showRaw ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
          <AnimatePresence>
            {showRaw && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <pre
                  className="text-[9px] font-mono leading-relaxed rounded-xl px-3 py-2.5 overflow-x-auto"
                  style={{
                    background: "oklch(0.08 0.01 280)",
                    border: "1px solid oklch(0.18 0.01 280)",
                    color: "oklch(0.72 0.08 180)",
                  }}
                  data-ocid="raw-response-snippet"
                >
                  {rawSnippet}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer hint */}
        <div
          className="px-4 py-2 flex items-center gap-1.5 border-t"
          style={{ borderColor: "oklch(0.18 0.01 280)" }}
        >
          <Zap className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground font-mono">
            Ask a follow-up to continue the conversation
          </span>
        </div>
      </div>
    </motion.div>
  );
}
