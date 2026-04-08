import { useCallback, useRef } from "react";
import {
  detectAgentType,
  generateFlowSteps,
  generateMockResponse,
  toQueryRecord,
} from "../lib/flowUtils";
import { useFlowStore } from "../store/flowStore";
import type { FlowStep } from "../types";

export function useAgentFlow() {
  const {
    setFlowStatus,
    setFlowSteps,
    setSelectedAgent,
    activateNode,
    pulseNode,
    resetFlow,
    setLastResult,
    addQueryRecord,
    setMemoryContext,
    memoryContext,
    queryHistory,
  } = useFlowStore();

  const cancelRef = useRef(false);

  const runFlowStep = useCallback(
    async (step: FlowStep): Promise<void> => {
      return new Promise((resolve) => {
        if (cancelRef.current) {
          resolve();
          return;
        }

        if (step.type === "activate") {
          activateNode(step.nodeId);
        } else if (step.type === "pulse") {
          pulseNode(step.nodeId);
        }

        setTimeout(resolve, step.durationMs);
      });
    },
    [activateNode, pulseNode],
  );

  const submitQuery = useCallback(
    async (query: string) => {
      if (!query.trim()) return;

      cancelRef.current = false;
      resetFlow();

      // Phase 1: routing
      setFlowStatus("routing");
      const agentType = detectAgentType(query);
      setSelectedAgent(agentType);

      const steps = generateFlowSteps(agentType);
      setFlowSteps(steps);

      // Animate base steps (orchestrator + memory)
      const baseSteps = steps.slice(0, 3);
      for (const step of baseSteps) {
        if (cancelRef.current) return;
        await runFlowStep(step);
      }

      // Phase 2: executing
      setFlowStatus("executing");
      const agentSteps = steps.slice(3, steps.length - 3);
      for (const step of agentSteps) {
        if (cancelRef.current) return;
        await runFlowStep(step);
      }

      // Phase 3: storing
      setFlowStatus("storing");
      const finalSteps = steps.slice(steps.length - 3);
      for (const step of finalSteps) {
        if (cancelRef.current) return;
        await runFlowStep(step);
      }

      // Generate mock result
      const result = generateMockResponse(query, agentType);
      setLastResult(result);

      const record = toQueryRecord(query, result);
      addQueryRecord(record);

      // Update memory context
      const totalUsage = queryHistory[agentType].length + 1;
      setMemoryContext({
        totalQueries: (memoryContext?.totalQueries ?? 0) + 1,
        recentTopics: [
          query.split(" ").slice(0, 3).join(" "),
          ...(memoryContext?.recentTopics ?? []),
        ].slice(0, 5),
        agentUsage: {
          travel:
            agentType === "travel"
              ? totalUsage
              : (memoryContext?.agentUsage.travel ?? 0),
          trading:
            agentType === "trading"
              ? totalUsage
              : (memoryContext?.agentUsage.trading ?? 0),
          general:
            agentType === "general"
              ? totalUsage
              : (memoryContext?.agentUsage.general ?? 0),
        },
        lastUpdated: Date.now(),
      });

      setFlowStatus("complete");
    },
    [
      resetFlow,
      setFlowStatus,
      setSelectedAgent,
      setFlowSteps,
      runFlowStep,
      setLastResult,
      addQueryRecord,
      setMemoryContext,
      memoryContext,
      queryHistory,
    ],
  );

  const cancelFlow = useCallback(() => {
    cancelRef.current = true;
    resetFlow();
  }, [resetFlow]);

  return { submitQuery, cancelFlow };
}
