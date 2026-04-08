export type AgentType = "travel" | "trading" | "general";

export type NodeId =
  | "orchestrator"
  | "travel"
  | "trading"
  | "general"
  | "memory"
  | "flight-api"
  | "hotel-db"
  | "weather-svc"
  | "market-feed"
  | "order-exec"
  | "portfolio-sync"
  | "knowledge-base-1"
  | "knowledge-base-2"
  | "web-search"
  | "code-interpreter";

export type FlowStatus =
  | "idle"
  | "routing"
  | "executing"
  | "storing"
  | "complete"
  | "error";

export interface FlowStep {
  nodeId: NodeId;
  label: string;
  durationMs: number;
  type: "activate" | "pulse" | "deactivate";
}

export interface ToolCall {
  toolName: string;
  input: string;
  output: string;
  durationMs: number;
  timestamp: number;
}

export interface QueryRecord {
  id: string;
  query: string;
  agentType: AgentType;
  response: string;
  toolCalls: ToolCall[];
  timestamp: number;
  durationMs: number;
}

export interface QueryResult {
  id: string;
  agentType: AgentType;
  response: string;
  toolCalls: ToolCall[];
  durationMs: number;
  confidence: number;
}

export interface MemoryContext {
  totalQueries: number;
  recentTopics: string[];
  agentUsage: Record<AgentType, number>;
  lastUpdated: number;
}

export interface NodeState {
  id: NodeId;
  isActive: boolean;
  isPulsing: boolean;
  isSelected: boolean;
  glowIntensity: number;
}

export interface AgentFlowState {
  currentQuery: string;
  flowStatus: FlowStatus;
  activeNodes: Set<NodeId>;
  pulsingNodes: Set<NodeId>;
  selectedAgent: AgentType | null;
  selectedNode: NodeId | null;
  flowSteps: FlowStep[];
  currentStepIndex: number;
  lastResult: QueryResult | null;
  queryHistory: Record<AgentType, QueryRecord[]>;
  memoryContext: MemoryContext | null;
}
