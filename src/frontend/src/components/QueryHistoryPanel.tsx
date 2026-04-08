import { CheckCircle, Clock, Cpu, Wrench, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { AGENT_LABELS } from "../lib/flowUtils";
import { useFlowStore } from "../store/flowStore";
import type { AgentType, QueryRecord } from "../types";

interface Props {
  agentType: AgentType;
  onClose: () => void;
  onAgentChange: (agent: AgentType) => void;
}

const AGENTS: AgentType[] = ["travel", "trading", "general"];

const PANEL_AGENT_COLORS: Record<AgentType, string> = {
  travel: "oklch(0.68 0.18 110)",
  trading: "oklch(0.72 0.21 65)",
  general: "oklch(0.55 0.23 20)",
};

const AGENT_ICONS: Record<AgentType, string> = {
  travel: "✈",
  trading: "📈",
  general: "🧠",
};

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function formatDuration(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

interface HistoryItemProps {
  record: QueryRecord;
  color: string;
  index: number;
}

function HistoryItem({ record, color, index }: HistoryItemProps) {
  const dimColor = color.replace(")", " / 0.20)");
  const bgColor = color.replace(")", " / 0.07)");

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="px-4 py-3.5 hover:bg-muted/20 transition-smooth cursor-default border-b border-border/20 last:border-0"
      data-ocid={`history-record-${record.id}`}
    >
      {/* Query text + timestamp */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-[11px] font-body text-foreground/90 leading-snug line-clamp-2 flex-1 min-w-0">
          {record.query}
        </p>
        <span className="text-[9px] font-mono text-muted-foreground shrink-0 mt-0.5">
          {formatRelativeTime(record.timestamp)}
        </span>
      </div>

      {/* Response snippet */}
      <p className="text-[10px] text-muted-foreground font-body leading-snug line-clamp-2 mb-2.5">
        {record.response}
      </p>

      {/* Tools used */}
      {record.toolCalls.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          {record.toolCalls.map((tool) => (
            <span
              key={tool.toolName}
              className="flex items-center gap-1 text-[8px] font-mono px-1.5 py-0.5 rounded"
              style={{
                color,
                background: bgColor,
                border: `1px solid ${dimColor}`,
              }}
            >
              <Wrench className="w-2 h-2 shrink-0" />
              <span className="truncate max-w-[72px]">{tool.toolName}</span>
            </span>
          ))}
        </div>
      )}

      {/* Footer meta */}
      <div className="flex items-center gap-3 text-[8.5px] font-mono text-muted-foreground/70">
        <span className="flex items-center gap-1">
          <Cpu className="w-2.5 h-2.5" />
          {record.toolCalls.length} tool
          {record.toolCalls.length !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          {formatDuration(record.durationMs)}
        </span>
        <span className="flex items-center gap-1 ml-auto" style={{ color }}>
          <CheckCircle className="w-2.5 h-2.5" />
          complete
        </span>
      </div>
    </motion.div>
  );
}

export function QueryHistoryPanel({
  agentType,
  onClose,
  onAgentChange,
}: Props) {
  const { queryHistory } = useFlowStore();
  const records = queryHistory[agentType];
  const color = PANEL_AGENT_COLORS[agentType];
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    // Slight delay so the open-click doesn't immediately close it
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 150);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, x: 340 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 340 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="absolute right-0 top-0 h-full z-30 w-80 border-l border-border/40 flex flex-col"
      style={{
        background: "oklch(0.10 0.01 280 / 0.97)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
      data-ocid="history-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-[11px]"
            style={{ background: color.replace(")", " / 0.12)") }}
          >
            {AGENT_ICONS[agentType]}
          </div>
          <span className="text-sm font-display font-semibold text-foreground">
            Query History
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-smooth"
          data-ocid="close-history"
          aria-label="Close history panel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Agent tabs */}
      <div className="flex border-b border-border/40">
        {AGENTS.map((agent) => {
          const isSelected = agentType === agent;
          const agentColor = PANEL_AGENT_COLORS[agent];
          return (
            <button
              key={agent}
              type="button"
              onClick={() => onAgentChange(agent)}
              data-ocid={`history-tab-${agent}`}
              className="flex-1 py-2.5 text-[10px] font-display font-semibold transition-smooth relative"
              style={{
                color: isSelected ? agentColor : "oklch(0.52 0.03 280)",
              }}
            >
              <span className="relative z-10">
                {agent.charAt(0).toUpperCase() + agent.slice(1)}
              </span>
              {isSelected && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: agentColor }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Agent label bar */}
      <div className="px-4 py-2 border-b border-border/20 flex items-center gap-2">
        <div
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: color }}
        />
        <span className="text-[10px] font-mono text-muted-foreground">
          {AGENT_LABELS[agentType]}
        </span>
        <span className="ml-auto text-[9px] font-mono text-muted-foreground">
          {records.length} {records.length === 1 ? "query" : "queries"}
        </span>
      </div>

      {/* Records list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <AnimatePresence mode="wait">
          {records.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground px-6"
              data-ocid="history-empty"
            >
              <Clock className="w-8 h-8 opacity-25" />
              <div className="text-center">
                <p className="text-xs font-body">No queries yet</p>
                <p className="text-[10px] opacity-60 mt-0.5">
                  Submit a query to see history
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div key={agentType}>
              {records.map((record, i) => (
                <HistoryItem
                  key={record.id}
                  record={record}
                  color={color}
                  index={i}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer branding */}
      <div
        className="px-4 py-3 border-t border-border/30"
        style={{ background: "oklch(0.09 0.01 280 / 0.8)" }}
      >
        <p className="text-[9px] font-mono text-muted-foreground text-center">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.hostname : "",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent/80 transition-smooth"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </motion.div>
  );
}
