import CommonTypes "types/common";
import QueryApiMixin "mixins/query-api";
import List "mo:core/List";
import Map "mo:core/Map";
import OutCall "mo:caffeineai-http-outcalls/outcall";

actor {
  let queryHistory = List.empty<CommonTypes.QueryRecord>();
  let queryStatusMap = Map.empty<CommonTypes.QueryId, CommonTypes.QueryStatus>();
  let queryCounter = { var count : Nat = 0 };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  include QueryApiMixin(queryHistory, queryStatusMap, queryCounter, transform);
};
