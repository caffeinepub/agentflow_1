import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  detectAgentType,
  generateMockResponse,
  toQueryRecord,
} from "../lib/flowUtils";
import type {
  AgentType,
  MemoryContext,
  QueryRecord,
  QueryResult,
} from "../types";

// Since the backend interface is currently empty (no methods defined yet),
// these hooks use local state management via the flow store.
// When backend methods are added, replace the mock implementations here.

interface SubmitQueryInput {
  query: string;
}

export function useSubmitQuery() {
  const queryClient = useQueryClient();

  return useMutation<QueryResult, Error, SubmitQueryInput>({
    mutationFn: async ({ query }) => {
      // Simulate network latency for realistic feel
      await new Promise((r) => setTimeout(r, 100));
      const agentType = detectAgentType(query);
      return generateMockResponse(query, agentType);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["agentHistory"] });
      void queryClient.invalidateQueries({ queryKey: ["memoryContext"] });
    },
  });
}

export function useAgentHistory(agentType: AgentType) {
  return useQuery<QueryRecord[]>({
    queryKey: ["agentHistory", agentType],
    queryFn: async (): Promise<QueryRecord[]> => {
      // Backend method not yet defined — returns empty until backend is wired
      return [];
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useMemoryContext() {
  return useQuery<MemoryContext>({
    queryKey: ["memoryContext"],
    queryFn: async (): Promise<MemoryContext> => {
      // Backend method not yet defined — returns default until backend is wired
      return {
        totalQueries: 0,
        recentTopics: [],
        agentUsage: { travel: 0, trading: 0, general: 0 },
        lastUpdated: Date.now(),
      };
    },
    staleTime: 5_000,
    refetchInterval: 5_000,
  });
}
