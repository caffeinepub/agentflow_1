import Types "../types/orchestrator";
import CommonTypes "../types/common";
import List "mo:core/List";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Array "mo:core/Array";

module {
  // Determines which agent should handle a given query based on keywords
  public func routeQuery(queryText : Text) : Types.RouteDecision {
    let lower = queryText.toLower();

    let travelKeywords = ["hotel", "hotels", "flight", "flights", "travel", "booking", "airfare", "airline", "trip", "vacation", "resort", "accommodation", "stay", "check-in", "checkout", "room", "airport", "destination"];
    let tradingKeywords = ["crypto", "bitcoin", "btc", "eth", "ethereum", "binance", "price", "trading", "stock", "market", "coin", "token", "ticker", "exchange", "chart", "buy", "sell", "portfolio", "altcoin", "bnb", "usdt", "sol", "solana"];

    var travelScore = 0;
    var tradingScore = 0;

    for (kw in travelKeywords.values()) {
      if (lower.contains(#text kw)) {
        travelScore += 1;
      };
    };

    for (kw in tradingKeywords.values()) {
      if (lower.contains(#text kw)) {
        tradingScore += 1;
      };
    };

    if (travelScore > 0 and travelScore >= tradingScore) {
      { agentType = #travel; confidence = Nat.min(100, travelScore * 25); reasoning = "Travel keywords detected: hotel/flight/booking terms found" };
    } else if (tradingScore > 0) {
      { agentType = #trading; confidence = Nat.min(100, tradingScore * 25); reasoning = "Trading keywords detected: crypto/price/market terms found" };
    } else {
      { agentType = #general; confidence = 60; reasoning = "No domain-specific keywords detected — routing to general agent" };
    };
  };

  // Generates a unique query ID
  public func generateQueryId(counter : Nat, timestamp : CommonTypes.Timestamp) : CommonTypes.QueryId {
    "q-" # counter.toText() # "-" # timestamp.toText();
  };

  // Converts AgentType to display string
  public func agentTypeToText(agentType : CommonTypes.AgentType) : Text {
    switch agentType {
      case (#travel) "travel";
      case (#trading) "trading";
      case (#general) "general";
    };
  };

  // Parses agent type text back to variant
  public func textToAgentType(text : Text) : ?CommonTypes.AgentType {
    switch (text.toLower()) {
      case "travel" ?#travel;
      case "trading" ?#trading;
      case "general" ?#general;
      case _ null;
    };
  };

  // Gets the list of distinct active agents from query history
  public func computeActiveAgents(history : List.List<CommonTypes.QueryRecord>) : [CommonTypes.AgentType] {
    var hasTravel = false;
    var hasTrading = false;
    var hasGeneral = false;
    history.forEach(func(r) {
      switch (r.agentType) {
        case (#travel) { hasTravel := true };
        case (#trading) { hasTrading := true };
        case (#general) { hasGeneral := true };
      };
    });
    let result = List.empty<CommonTypes.AgentType>();
    if (hasTravel) result.add(#travel);
    if (hasTrading) result.add(#trading);
    if (hasGeneral) result.add(#general);
    result.toArray();
  };

  // Gets the last N tool calls across all recent queries
  public func computeLastToolCalls(history : List.List<CommonTypes.QueryRecord>, limit : Nat) : [CommonTypes.ToolCall] {
    let allCalls = List.empty<CommonTypes.ToolCall>();
    history.forEach(func(r) {
      for (tc in r.toolsUsed.values()) {
        allCalls.add(tc);
      };
    });
    let arr = allCalls.toArray();
    let sz = arr.size();
    if (sz <= limit) {
      arr;
    } else {
      arr.sliceToArray(Int.fromNat(sz - limit), Int.fromNat(sz));
    };
  };
};
