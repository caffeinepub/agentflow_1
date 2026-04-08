module {
  public type Timestamp = Int;
  public type QueryId = Text;

  public type AgentType = {
    #travel;
    #trading;
    #general;
  };

  public type ToolCall = {
    toolName : Text;
    input : Text;
    output : Text;
  };

  public type QueryRecord = {
    queryId : QueryId;
    timestamp : Timestamp;
    queryText : Text;
    agentType : AgentType;
    toolsUsed : [ToolCall];
    resultSummary : Text;
    rawApiResponse : Text;
  };

  public type QueryResult = {
    queryId : QueryId;
    agentType : AgentType;
    toolsUsed : [ToolCall];
    resultSummary : Text;
    rawApiResponse : Text;
    timestamp : Timestamp;
  };

  public type QueryStatus = {
    queryId : QueryId;
    status : { #pending; #complete; #failed };
    agentType : ?AgentType;
    resultSummary : ?Text;
    timestamp : Timestamp;
  };

  public type MemoryContext = {
    recentQueries : [QueryRecord];
    activeAgents : [AgentType];
    lastToolCalls : [ToolCall];
    totalQueryCount : Nat;
  };
};
