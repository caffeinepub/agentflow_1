import CommonTypes "../types/common";
import OutCall "mo:caffeineai-http-outcalls/outcall";

module {
  // Calls a web search API (DuckDuckGo Instant Answer) for general queries
  public func webSearch(queryText : Text, transform : OutCall.Transform) : async CommonTypes.ToolCall {
    // URL-encode the query: replace spaces with +
    let encoded = queryText.replace(#char ' ', "+");
    let url = "https://api.duckduckgo.com/?q=" # encoded # "&format=json&no_html=1&skip_disambig=1";
    let response = await OutCall.httpGetRequest(url, [], transform);
    {
      toolName = "duckduckgo_search";
      input = queryText;
      output = response;
    };
  };

  // Orchestrates general query: calls web search and returns result
  public func handleQuery(queryText : Text, transform : OutCall.Transform) : async (CommonTypes.ToolCall, Text) {
    let searchCall = await webSearch(queryText, transform);
    let summary = "Web search results for \"" # queryText # "\": " # searchCall.output;
    (searchCall, summary);
  };
};
