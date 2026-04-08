import CommonTypes "../types/common";
import OutCall "mo:caffeineai-http-outcalls/outcall";

module {
  // Calls Binance REST API for spot price of a symbol
  public func getSpotPrice(symbol : Text, transform : OutCall.Transform) : async CommonTypes.ToolCall {
    let url = "https://api.binance.com/api/v3/ticker/price?symbol=" # symbol;
    let response = await OutCall.httpGetRequest(url, [], transform);
    {
      toolName = "binance_spot_price";
      input = symbol;
      output = response;
    };
  };

  // Calls Binance REST API for 24h ticker stats
  public func getTicker24h(symbol : Text, transform : OutCall.Transform) : async CommonTypes.ToolCall {
    let url = "https://api.binance.com/api/v3/ticker/24hr?symbol=" # symbol;
    let response = await OutCall.httpGetRequest(url, [], transform);
    {
      toolName = "binance_ticker_24h";
      input = symbol;
      output = response;
    };
  };

  // Extracts ticker symbol from a natural language trading query
  public func extractSymbol(queryText : Text) : Text {
    let lower = queryText.toLower();
    // Map common names to Binance symbols
    if (lower.contains(#text "bitcoin") or lower.contains(#text "btc")) {
      "BTCUSDT";
    } else if (lower.contains(#text "ethereum") or lower.contains(#text "eth")) {
      "ETHUSDT";
    } else if (lower.contains(#text "solana") or lower.contains(#text "sol")) {
      "SOLUSDT";
    } else if (lower.contains(#text "bnb") or lower.contains(#text "binance coin")) {
      "BNBUSDT";
    } else if (lower.contains(#text "cardano") or lower.contains(#text "ada")) {
      "ADAUSDT";
    } else if (lower.contains(#text "xrp") or lower.contains(#text "ripple")) {
      "XRPUSDT";
    } else if (lower.contains(#text "dogecoin") or lower.contains(#text "doge")) {
      "DOGEUSDT";
    } else if (lower.contains(#text "polygon") or lower.contains(#text "matic")) {
      "MATICUSDT";
    } else if (lower.contains(#text "litecoin") or lower.contains(#text "ltc")) {
      "LTCUSDT";
    } else if (lower.contains(#text "usdt") or lower.contains(#text "tether")) {
      "BTCUSDT";
    } else {
      // Default to Bitcoin
      "BTCUSDT";
    };
  };

  // Orchestrates trading query: picks appropriate tools and returns result
  public func handleQuery(queryText : Text, transform : OutCall.Transform) : async (CommonTypes.ToolCall, Text) {
    let symbol = extractSymbol(queryText);
    let spotCall = await getSpotPrice(symbol, transform);
    let ticker24hCall = await getTicker24h(symbol, transform);
    let summary = "Trading data for " # symbol # ": Price=" # spotCall.output # " | 24h Stats=" # ticker24hCall.output;
    let combinedCall : CommonTypes.ToolCall = {
      toolName = "trading_agent";
      input = queryText;
      output = spotCall.output # " | " # ticker24hCall.output;
    };
    (combinedCall, summary);
  };
};
