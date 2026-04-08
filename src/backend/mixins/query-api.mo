import CommonTypes "../types/common";
import OrchestratorLib "../lib/orchestrator";
import TravelAgent "../lib/travel-agent";
import TradingAgent "../lib/trading-agent";
import GeneralAgent "../lib/general-agent";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Error "mo:core/Error";
import OutCall "mo:caffeineai-http-outcalls/outcall";

mixin (
  queryHistory : List.List<CommonTypes.QueryRecord>,
  queryStatusMap : Map.Map<CommonTypes.QueryId, CommonTypes.QueryStatus>,
  queryCounter : { var count : Nat },
  transformFn : OutCall.Transform
) {
  // Submit a user query; routes to the appropriate agent and returns results
  public shared func submitQuery(queryText : Text) : async CommonTypes.QueryResult {
    let now = Time.now();
    queryCounter.count += 1;
    let queryId = OrchestratorLib.generateQueryId(queryCounter.count, now);

    // Record pending status
    let pendingStatus : CommonTypes.QueryStatus = {
      queryId;
      status = #pending;
      agentType = null;
      resultSummary = null;
      timestamp = now;
    };
    queryStatusMap.add(queryId, pendingStatus);

    // Route the query
    let decision = OrchestratorLib.routeQuery(queryText);

    // Dispatch to the appropriate agent
    let (toolCall, summary) = try {
      switch (decision.agentType) {
        case (#travel) await TravelAgent.handleQuery(queryText, transformFn);
        case (#trading) await TradingAgent.handleQuery(queryText, transformFn);
        case (#general) await GeneralAgent.handleQuery(queryText, transformFn);
      };
    } catch (e) {
      let errCall : CommonTypes.ToolCall = {
        toolName = OrchestratorLib.agentTypeToText(decision.agentType) # "_agent";
        input = queryText;
        output = "Error: " # e.message();
      };
      (errCall, "Agent encountered an error: " # e.message());
    };

    let record : CommonTypes.QueryRecord = {
      queryId;
      timestamp = now;
      queryText;
      agentType = decision.agentType;
      toolsUsed = [toolCall];
      resultSummary = summary;
      rawApiResponse = toolCall.output;
    };

    queryHistory.add(record);

    // Update status to complete
    let completeStatus : CommonTypes.QueryStatus = {
      queryId;
      status = #complete;
      agentType = ?decision.agentType;
      resultSummary = ?summary;
      timestamp = now;
    };
    queryStatusMap.add(queryId, completeStatus);

    {
      queryId;
      agentType = decision.agentType;
      toolsUsed = [toolCall];
      resultSummary = summary;
      rawApiResponse = toolCall.output;
      timestamp = now;
    };
  };

  // Returns the full query history for a given agent type (by text: "travel" | "trading" | "general")
  public query func getAgentHistory(agentTypeText : Text) : async [CommonTypes.QueryRecord] {
    switch (OrchestratorLib.textToAgentType(agentTypeText)) {
      case (?agentType) {
        queryHistory.filter(func(r) { r.agentType == agentType }).toArray();
      };
      case null { [] };
    };
  };

  // Returns shared memory context: recent queries, active agents, last tool calls
  public query func getMemoryContext() : async CommonTypes.MemoryContext {
    let allRecords = queryHistory.toArray();
    let total = allRecords.size();
    let recentStart : Int = if (total > 10) Int.fromNat(total - 10) else 0;
    let recentRecords = allRecords.sliceToArray(recentStart, Int.fromNat(total));
    let activeAgents = OrchestratorLib.computeActiveAgents(queryHistory);
    let lastToolCalls = OrchestratorLib.computeLastToolCalls(queryHistory, 5);
    {
      recentQueries = recentRecords;
      activeAgents;
      lastToolCalls;
      totalQueryCount = total;
    };
  };

  // Returns the status of a specific query by ID
  public query func getQueryStatus(queryId : Text) : async CommonTypes.QueryStatus {
    switch (queryStatusMap.get(queryId)) {
      case (?status) status;
      case null {
        {
          queryId;
          status = #failed;
          agentType = null;
          resultSummary = ?"Query not found";
          timestamp = Time.now();
        };
      };
    };
  };
};
