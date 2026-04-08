import CommonTypes "../types/common";
import OutCall "mo:caffeineai-http-outcalls/outcall";

module {
  // Calls Booking.com RapidAPI to search for hotels based on query
  public func searchHotels(queryText : Text, transform : OutCall.Transform) : async CommonTypes.ToolCall {
    let destination = extractDestination(queryText);
    let encoded = destination.replace(#char ' ', "%20");
    let url = "https://hotels4.p.rapidapi.com/locations/v3/search?q=" # encoded # "&locale=en_US&langid=1033&siteid=300000001";
    let headers : [OutCall.Header] = [
      { name = "X-RapidAPI-Key"; value = "demo_key" },
      { name = "X-RapidAPI-Host"; value = "hotels4.p.rapidapi.com" },
    ];
    let response = await OutCall.httpGetRequest(url, headers, transform);
    {
      toolName = "booking_hotel_search";
      input = destination;
      output = response;
    };
  };

  // Calls a flight search API endpoint (SerpAPI Google Flights)
  public func searchFlights(queryText : Text, transform : OutCall.Transform) : async CommonTypes.ToolCall {
    let destination = extractDestination(queryText);
    let encoded = destination.replace(#char ' ', "+");
    let url = "https://serpapi.com/search.json?engine=google_flights&q=flights+to+" # encoded # "&api_key=demo_key";
    let response = await OutCall.httpGetRequest(url, [], transform);
    {
      toolName = "google_flights_search";
      input = destination;
      output = response;
    };
  };

  // Simple destination extractor from query text using split
  func extractDestination(queryText : Text) : Text {
    let lower = queryText.toLower();
    let prepositions : [Text] = ["to ", "in ", "at "];
    var result : ?Text = null;
    for (prep in prepositions.values()) {
      if (result == null) {
        let parts = lower.split(#text prep).toArray();
        if (parts.size() >= 2) {
          let afterParts = queryText.split(#text prep).toArray();
          if (afterParts.size() >= 2) {
            let remainder = afterParts[1];
            let words = remainder.split(#char ' ').toArray();
            if (words.size() >= 2) {
              result := ?(words[0] # " " # words[1]);
            } else if (words.size() == 1) {
              result := ?words[0];
            };
          };
        };
      };
    };
    switch result {
      case (?dest) dest;
      case null queryText;
    };
  };

  // Orchestrates travel query: picks appropriate tools and returns result
  public func handleQuery(queryText : Text, transform : OutCall.Transform) : async (CommonTypes.ToolCall, Text) {
    let lower = queryText.toLower();
    let isFlightQuery = lower.contains(#text "flight") or lower.contains(#text "fly") or lower.contains(#text "airfare") or lower.contains(#text "airline");
    let isHotelQuery = lower.contains(#text "hotel") or lower.contains(#text "accommodation") or lower.contains(#text "stay") or lower.contains(#text "room") or lower.contains(#text "resort");

    if (isFlightQuery and not isHotelQuery) {
      let flightCall = await searchFlights(queryText, transform);
      let summary = "Flight search results for \"" # queryText # "\": " # flightCall.output;
      (flightCall, summary);
    } else if (isHotelQuery and not isFlightQuery) {
      let hotelCall = await searchHotels(queryText, transform);
      let summary = "Hotel search results for \"" # queryText # "\": " # hotelCall.output;
      (hotelCall, summary);
    } else {
      // Both or ambiguous — default to hotel search
      let hotelCall = await searchHotels(queryText, transform);
      let summary = "Travel search results for \"" # queryText # "\": " # hotelCall.output;
      (hotelCall, summary);
    };
  };
};
