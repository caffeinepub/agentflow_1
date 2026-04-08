import CommonTypes "../types/common";

module {
  public type AgentType = CommonTypes.AgentType;
  public type QueryId = CommonTypes.QueryId;
  public type Timestamp = CommonTypes.Timestamp;
  public type QueryRecord = CommonTypes.QueryRecord;
  public type QueryResult = CommonTypes.QueryResult;
  public type QueryStatus = CommonTypes.QueryStatus;
  public type MemoryContext = CommonTypes.MemoryContext;
  public type ToolCall = CommonTypes.ToolCall;

  public type RouteDecision = {
    agentType : AgentType;
    confidence : Nat; // 0-100
    reasoning : Text;
  };
};
