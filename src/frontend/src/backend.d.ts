import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface QueryRecord {
    toolsUsed: Array<ToolCall>;
    queryText: string;
    agentType: AgentType;
    rawApiResponse: string;
    queryId: QueryId;
    timestamp: Timestamp;
    resultSummary: string;
}
export interface MemoryContext {
    totalQueryCount: bigint;
    lastToolCalls: Array<ToolCall>;
    recentQueries: Array<QueryRecord>;
    activeAgents: Array<AgentType>;
}
export type Timestamp = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface QueryResult {
    toolsUsed: Array<ToolCall>;
    agentType: AgentType;
    rawApiResponse: string;
    queryId: QueryId;
    timestamp: Timestamp;
    resultSummary: string;
}
export interface ToolCall {
    output: string;
    toolName: string;
    input: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type QueryId = string;
export interface QueryStatus {
    status: Variant_pending_complete_failed;
    agentType?: AgentType;
    queryId: QueryId;
    timestamp: Timestamp;
    resultSummary?: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export enum AgentType {
    travel = "travel",
    trading = "trading",
    general = "general"
}
export enum Variant_pending_complete_failed {
    pending = "pending",
    complete = "complete",
    failed = "failed"
}
export interface backendInterface {
    getAgentHistory(agentTypeText: string): Promise<Array<QueryRecord>>;
    getMemoryContext(): Promise<MemoryContext>;
    getQueryStatus(queryId: string): Promise<QueryStatus>;
    submitQuery(queryText: string): Promise<QueryResult>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
