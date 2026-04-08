import { create } from "zustand";
import type {
  AgentType,
  FlowStatus,
  FlowStep,
  MemoryContext,
  NodeId,
  QueryRecord,
  QueryResult,
} from "../types";

interface FlowStore {
  // Query input
  currentQuery: string;
  setCurrentQuery: (query: string) => void;

  // Flow animation state
  flowStatus: FlowStatus;
  setFlowStatus: (status: FlowStatus) => void;
  activeNodes: Set<NodeId>;
  pulsingNodes: Set<NodeId>;
  activateNode: (nodeId: NodeId) => void;
  pulseNode: (nodeId: NodeId) => void;
  deactivateNode: (nodeId: NodeId) => void;
  resetFlow: () => void;

  // Step tracking
  flowSteps: FlowStep[];
  currentStepIndex: number;
  setFlowSteps: (steps: FlowStep[]) => void;
  advanceStep: () => void;

  // Agent routing
  selectedAgent: AgentType | null;
  setSelectedAgent: (agent: AgentType | null) => void;

  // Node selection (for side panel)
  selectedNode: NodeId | null;
  setSelectedNode: (nodeId: NodeId | null) => void;

  // Results
  lastResult: QueryResult | null;
  setLastResult: (result: QueryResult | null) => void;

  // History per agent
  queryHistory: Record<AgentType, QueryRecord[]>;
  addQueryRecord: (record: QueryRecord) => void;

  // Memory context
  memoryContext: MemoryContext | null;
  setMemoryContext: (ctx: MemoryContext) => void;
}

export const useFlowStore = create<FlowStore>((set) => ({
  currentQuery: "",
  setCurrentQuery: (query) => set({ currentQuery: query }),

  flowStatus: "idle",
  setFlowStatus: (status) => set({ flowStatus: status }),

  activeNodes: new Set(),
  pulsingNodes: new Set(),

  activateNode: (nodeId) =>
    set((state) => ({
      activeNodes: new Set([...state.activeNodes, nodeId]),
      pulsingNodes: new Set(
        [...state.pulsingNodes].filter((n) => n !== nodeId),
      ),
    })),

  pulseNode: (nodeId) =>
    set((state) => ({
      pulsingNodes: new Set([...state.pulsingNodes, nodeId]),
    })),

  deactivateNode: (nodeId) =>
    set((state) => ({
      activeNodes: new Set([...state.activeNodes].filter((n) => n !== nodeId)),
      pulsingNodes: new Set(
        [...state.pulsingNodes].filter((n) => n !== nodeId),
      ),
    })),

  resetFlow: () =>
    set({
      activeNodes: new Set(),
      pulsingNodes: new Set(),
      flowStatus: "idle",
      currentStepIndex: 0,
      flowSteps: [],
      selectedAgent: null,
      lastResult: null,
    }),

  flowSteps: [],
  currentStepIndex: 0,
  setFlowSteps: (steps) => set({ flowSteps: steps, currentStepIndex: 0 }),
  advanceStep: () =>
    set((state) => ({ currentStepIndex: state.currentStepIndex + 1 })),

  selectedAgent: null,
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),

  selectedNode: null,
  setSelectedNode: (nodeId) => set({ selectedNode: nodeId }),

  lastResult: null,
  setLastResult: (result) => set({ lastResult: result }),

  queryHistory: {
    travel: [
      {
        id: "q-seed-1",
        query: "Find me flights from NYC to Tokyo next month",
        agentType: "travel",
        response:
          "Found 6 direct flights starting at $842. Best option: ANA NH010 departing 11:05, arriving next day 14:30. 3 hotels near Shinjuku recommended from $89/night.",
        toolCalls: [
          {
            toolName: "FlightAPI",
            input: "NYC to Tokyo",
            output: "6 flights found",
            durationMs: 765,
            timestamp: Date.now() - 86400000,
          },
          {
            toolName: "HotelDatabase",
            input: "Tokyo Shinjuku",
            output: "12 hotels found",
            durationMs: 432,
            timestamp: Date.now() - 86400000,
          },
        ],
        timestamp: Date.now() - 86400000,
        durationMs: 3200,
      },
      {
        id: "q-seed-2",
        query: "Best hotels in Paris under $150/night",
        agentType: "travel",
        response:
          "Top picks: Hotel des Arts (4.7★, $138), Le Marais Boutique (4.5★, $127), Montmartre View (4.6★, $142). All include breakfast and are within 10 min walk of Metro.",
        toolCalls: [
          {
            toolName: "HotelDatabase",
            input: "Paris under $150",
            output: "8 hotels found",
            durationMs: 543,
            timestamp: Date.now() - 172800000,
          },
          {
            toolName: "WeatherService",
            input: "Paris",
            output: "22°C partly cloudy",
            durationMs: 211,
            timestamp: Date.now() - 172800000,
          },
        ],
        timestamp: Date.now() - 172800000,
        durationMs: 2800,
      },
    ],
    trading: [
      {
        id: "q-seed-3",
        query: "What is the current Bitcoin price and trend?",
        agentType: "trading",
        response:
          "BTC/USD: $67,420 (+2.3%). 24h high: $68,100, low: $65,900. RSI(14): 62.3 — mildly overbought. Volume up 34% vs 7-day avg. Short-term trend: bullish.",
        toolCalls: [
          {
            toolName: "MarketFeed",
            input: "BTC/USD",
            output: "Real-time price data",
            durationMs: 123,
            timestamp: Date.now() - 3600000,
          },
        ],
        timestamp: Date.now() - 3600000,
        durationMs: 1800,
      },
      {
        id: "q-seed-4",
        query: "Should I rebalance my portfolio toward tech stocks?",
        agentType: "trading",
        response:
          "Current tech allocation 28% vs recommended 32% for your risk profile. NVDA, MSFT showing strong momentum. Suggest gradual increase over 2 weeks. Estimated rebalancing cost: $45 in fees.",
        toolCalls: [
          {
            toolName: "PortfolioSync",
            input: "Current holdings",
            output: "Portfolio loaded",
            durationMs: 289,
            timestamp: Date.now() - 7200000,
          },
          {
            toolName: "MarketFeed",
            input: "Tech sector",
            output: "Sector data loaded",
            durationMs: 156,
            timestamp: Date.now() - 7200000,
          },
          {
            toolName: "OrderExecution",
            input: "Rebalance plan",
            output: "Strategy generated",
            durationMs: 734,
            timestamp: Date.now() - 7200000,
          },
        ],
        timestamp: Date.now() - 7200000,
        durationMs: 3600,
      },
    ],
    general: [
      {
        id: "q-seed-5",
        query: "Explain how transformer models work",
        agentType: "general",
        response:
          "Transformers use self-attention mechanisms to process sequential data in parallel. Key components: positional encoding, multi-head attention, feed-forward layers, and layer normalization. BERT uses bidirectional context; GPT uses causal masking. Validated 3 code examples showing attention computation.",
        toolCalls: [
          {
            toolName: "KnowledgeBase",
            input: "transformer architecture",
            output: "23 papers found",
            durationMs: 678,
            timestamp: Date.now() - 43200000,
          },
          {
            toolName: "WebSearch",
            input: "transformer model explained",
            output: "5 sources",
            durationMs: 891,
            timestamp: Date.now() - 43200000,
          },
          {
            toolName: "CodeInterpreter",
            input: "attention_weights demo",
            output: "Visualization ready",
            durationMs: 943,
            timestamp: Date.now() - 43200000,
          },
        ],
        timestamp: Date.now() - 43200000,
        durationMs: 4100,
      },
    ],
  },

  addQueryRecord: (record) =>
    set((state) => ({
      queryHistory: {
        ...state.queryHistory,
        [record.agentType]: [
          record,
          ...state.queryHistory[record.agentType],
        ].slice(0, 20),
      },
    })),

  memoryContext: {
    totalQueries: 7,
    recentTopics: ["AI models", "Bitcoin", "Paris travel", "Tokyo flights"],
    agentUsage: { travel: 3, trading: 2, general: 2 },
    lastUpdated: Date.now() - 600000,
  },
  setMemoryContext: (ctx) => set({ memoryContext: ctx }),
}));
