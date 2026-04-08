import type {
  AgentType,
  FlowStep,
  NodeId,
  QueryRecord,
  QueryResult,
  ToolCall,
} from "../types";

export function generateFlowSteps(agentType: AgentType): FlowStep[] {
  const baseSteps: FlowStep[] = [
    {
      nodeId: "orchestrator",
      label: "Orchestrator receives query",
      durationMs: 600,
      type: "activate",
    },
    {
      nodeId: "memory",
      label: "Fetching memory context",
      durationMs: 400,
      type: "activate",
    },
    {
      nodeId: "memory",
      label: "Memory context loaded",
      durationMs: 300,
      type: "pulse",
    },
  ];

  const agentSteps: Record<AgentType, FlowStep[]> = {
    travel: [
      {
        nodeId: "travel",
        label: "Routing to Travel Agent",
        durationMs: 500,
        type: "activate",
      },
      {
        nodeId: "flight-api",
        label: "Querying Flight API",
        durationMs: 800,
        type: "activate",
      },
      {
        nodeId: "flight-api",
        label: "Flight results received",
        durationMs: 400,
        type: "pulse",
      },
      {
        nodeId: "hotel-db",
        label: "Searching Hotel Database",
        durationMs: 700,
        type: "activate",
      },
      {
        nodeId: "hotel-db",
        label: "Hotels found",
        durationMs: 300,
        type: "pulse",
      },
      {
        nodeId: "weather-svc",
        label: "Checking Weather Service",
        durationMs: 500,
        type: "activate",
      },
      {
        nodeId: "weather-svc",
        label: "Weather data ready",
        durationMs: 300,
        type: "pulse",
      },
      {
        nodeId: "travel",
        label: "Travel Agent synthesizing",
        durationMs: 600,
        type: "pulse",
      },
    ],
    trading: [
      {
        nodeId: "trading",
        label: "Routing to Trading Agent",
        durationMs: 500,
        type: "activate",
      },
      {
        nodeId: "market-feed",
        label: "Connecting to Market Feed",
        durationMs: 600,
        type: "activate",
      },
      {
        nodeId: "market-feed",
        label: "Live prices loaded",
        durationMs: 400,
        type: "pulse",
      },
      {
        nodeId: "order-exec",
        label: "Analyzing Order Execution",
        durationMs: 700,
        type: "activate",
      },
      {
        nodeId: "order-exec",
        label: "Execution plan ready",
        durationMs: 300,
        type: "pulse",
      },
      {
        nodeId: "portfolio-sync",
        label: "Syncing Portfolio",
        durationMs: 500,
        type: "activate",
      },
      {
        nodeId: "portfolio-sync",
        label: "Portfolio updated",
        durationMs: 300,
        type: "pulse",
      },
      {
        nodeId: "trading",
        label: "Trading Agent synthesizing",
        durationMs: 600,
        type: "pulse",
      },
    ],
    general: [
      {
        nodeId: "general",
        label: "Routing to General Agent",
        durationMs: 500,
        type: "activate",
      },
      {
        nodeId: "knowledge-base-1",
        label: "Querying Knowledge Base",
        durationMs: 700,
        type: "activate",
      },
      {
        nodeId: "knowledge-base-1",
        label: "Knowledge retrieved",
        durationMs: 400,
        type: "pulse",
      },
      {
        nodeId: "web-search",
        label: "Performing Web Search",
        durationMs: 800,
        type: "activate",
      },
      {
        nodeId: "web-search",
        label: "Search results in",
        durationMs: 400,
        type: "pulse",
      },
      {
        nodeId: "code-interpreter",
        label: "Running Code Interpreter",
        durationMs: 900,
        type: "activate",
      },
      {
        nodeId: "code-interpreter",
        label: "Code executed",
        durationMs: 300,
        type: "pulse",
      },
      {
        nodeId: "general",
        label: "General Agent synthesizing",
        durationMs: 600,
        type: "pulse",
      },
    ],
  };

  const finalSteps: FlowStep[] = [
    {
      nodeId: "orchestrator",
      label: "Orchestrator aggregating results",
      durationMs: 500,
      type: "pulse",
    },
    {
      nodeId: "memory",
      label: "Storing to memory",
      durationMs: 400,
      type: "pulse",
    },
    {
      nodeId: "orchestrator",
      label: "Response ready",
      durationMs: 300,
      type: "activate",
    },
  ];

  return [...baseSteps, ...agentSteps[agentType], ...finalSteps];
}

export function detectAgentType(query: string): AgentType {
  const lower = query.toLowerCase();

  const travelKeywords = [
    "flight",
    "hotel",
    "travel",
    "trip",
    "book",
    "vacation",
    "airline",
    "destination",
    "visa",
    "passport",
    "weather",
  ];
  const tradingKeywords = [
    "stock",
    "trade",
    "market",
    "price",
    "bitcoin",
    "crypto",
    "portfolio",
    "invest",
    "buy",
    "sell",
    "order",
    "shares",
  ];

  const travelScore = travelKeywords.filter((k) => lower.includes(k)).length;
  const tradingScore = tradingKeywords.filter((k) => lower.includes(k)).length;

  if (travelScore > tradingScore && travelScore > 0) return "travel";
  if (tradingScore > travelScore && tradingScore > 0) return "trading";
  return "general";
}

export function generateMockResponse(
  query: string,
  agentType: AgentType,
): QueryResult {
  const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const responses: Record<AgentType, string[]> = {
    travel: [
      "I found 3 direct flights from JFK to your destination starting at $389. Top hotel picks include The Grand Plaza (4.8★, $145/night) and Boutique Harbor Inn (4.6★, $98/night). Weather forecast shows 24°C with clear skies for your travel dates.",
      "Best travel options: Morning flight at 08:15 with 6h layover option or direct evening flight at 19:40. Recommend booking 2 weeks ahead for 23% savings. Hotel availability is high for your dates.",
    ],
    trading: [
      "Current market analysis: BTC at $67,420 (+2.3% 24h). Portfolio rebalancing suggests 5% increase in ETH allocation. Order execution via TWAP strategy recommended to minimize slippage. Risk score: 6.2/10.",
      "AAPL showing bullish divergence on 4h chart. RSI at 58, MACD crossing upward. Suggested entry: $182.50, target: $195, stop-loss: $178. Position size: 2% of portfolio for moderate risk profile.",
    ],
    general: [
      `Based on my research across multiple knowledge sources: The key factors to consider are (1) contextual relevance, (2) historical precedent, and (3) current best practices. I've synthesized 47 relevant documents and run 3 code examples to validate the approach.`,
      `Here's a comprehensive breakdown: The topic spans several interconnected domains. Web search returned 8 high-quality sources. Code interpreter validated the implementation with 100% test pass rate. Summary confidence: 94%.`,
    ],
  };

  const toolCallSets: Record<AgentType, ToolCall[]> = {
    travel: [
      {
        toolName: "FlightAPI",
        input: query,
        output: "Found 12 flights",
        durationMs: 823,
        timestamp: Date.now() - 2000,
      },
      {
        toolName: "HotelDatabase",
        input: query,
        output: "Found 8 hotels",
        durationMs: 654,
        timestamp: Date.now() - 1500,
      },
      {
        toolName: "WeatherService",
        input: query,
        output: "Weather data retrieved",
        durationMs: 412,
        timestamp: Date.now() - 1000,
      },
    ],
    trading: [
      {
        toolName: "MarketFeed",
        input: query,
        output: "Live prices fetched",
        durationMs: 156,
        timestamp: Date.now() - 2000,
      },
      {
        toolName: "OrderExecution",
        input: query,
        output: "Strategy analyzed",
        durationMs: 734,
        timestamp: Date.now() - 1500,
      },
      {
        toolName: "PortfolioSync",
        input: query,
        output: "Portfolio synced",
        durationMs: 289,
        timestamp: Date.now() - 800,
      },
    ],
    general: [
      {
        toolName: "KnowledgeBase",
        input: query,
        output: "47 documents retrieved",
        durationMs: 678,
        timestamp: Date.now() - 2500,
      },
      {
        toolName: "WebSearch",
        input: query,
        output: "8 sources found",
        durationMs: 891,
        timestamp: Date.now() - 1600,
      },
      {
        toolName: "CodeInterpreter",
        input: query,
        output: "Execution successful",
        durationMs: 943,
        timestamp: Date.now() - 600,
      },
    ],
  };

  const responseList = responses[agentType];
  const response =
    responseList[Math.floor(Math.random() * responseList.length)];

  return {
    id,
    agentType,
    response,
    toolCalls: toolCallSets[agentType],
    durationMs: 2800 + Math.floor(Math.random() * 1200),
    confidence: 0.85 + Math.random() * 0.14,
  };
}

export function toQueryRecord(query: string, result: QueryResult): QueryRecord {
  return {
    id: result.id,
    query,
    agentType: result.agentType,
    response: result.response,
    toolCalls: result.toolCalls,
    timestamp: Date.now(),
    durationMs: result.durationMs,
  };
}

export const AGENT_COLORS: Record<
  AgentType | "orchestrator" | "memory",
  string
> = {
  travel: "oklch(0.68 0.18 110)",
  trading: "oklch(0.72 0.21 65)",
  general: "oklch(0.55 0.23 20)",
  orchestrator: "oklch(0.75 0.15 280)",
  memory: "oklch(0.50 0.08 180)",
};

export const AGENT_LABELS: Record<AgentType, string> = {
  travel: "Travel Agent",
  trading: "Trading Agent",
  general: "General Agent",
};
