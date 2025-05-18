import { z } from 'zod';

// Base node data schema that all nodes will extend
export const baseNodeSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  description: z.string().optional(),
});

// ============ CORE STRUCTURAL NODES ============

// START Node Schema - Required entry point for all graphs
export const startNodeSchema = baseNodeSchema.extend({
  initialState: z.record(z.any()).optional(),
  description: z.string().default('Entry point of the graph'),
});

// END Node Schema - Terminal sink that marks successful completion
export const endNodeSchema = baseNodeSchema.extend({
  outputFormat: z.enum(['json', 'text', 'markdown']).default('text'),
  finalTransform: z.string().optional(),
  description: z.string().default('Terminal node that marks completion'),
});

// ============ PRIMITIVE EXECUTION NODES ============

// Agent Node Schema - Wraps an LLM or ReAct agent that can call tools
export const agentNodeSchema = baseNodeSchema.extend({
  agentType: z.enum(['llm', 'react', 'planAndExecute']).default('llm'),
  modelName: z.string().min(1, 'Model name is required'),
  temperature: z.number().min(0).max(1).default(0.7),
  maxTokens: z.number().int().positive().max(32000).optional(),
  systemPrompt: z.string().optional(),
  tools: z.array(z.string()).optional(),
  stopCondition: z.string().optional(),
  outputParser: z.string().optional(),
});

// Tool Node Schema - Executes tool calls with built-in concurrency & error handling
export const toolNodeSchema = baseNodeSchema.extend({
  modulePath: z.string().min(1, 'Module path is required'),
  functionName: z.string().min(1, 'Function name is required'),
  argsSchema: z.string().optional(),
  timeout: z.number().int().positive().optional(),
  concurrency: z.number().int().positive().default(1),
  errorHandling: z.enum(['fail', 'ignore', 'retry']).default('fail'),
  maxRetries: z.number().int().min(0).default(3),
});

// Memory Read Node Schema - Reads from short-term or long-term memory
export const memoryReadNodeSchema = baseNodeSchema.extend({
  memoryType: z.enum(['thread', 'longTerm']).default('thread'),
  key: z.string().min(1, 'Memory key is required'),
  filter: z.string().optional(),
});

// Memory Write Node Schema - Appends to short-term or long-term memory
export const memoryWriteNodeSchema = baseNodeSchema.extend({
  memoryType: z.enum(['thread', 'longTerm']).default('thread'),
  key: z.string().min(1, 'Memory key is required'),
  valueExpression: z.string().min(1, 'Value expression is required'),
});

// ============ CONTROL-FLOW / ORCHESTRATION NODES ============

// Decision Node Schema - Routes to one of several branches based on a predicate
export const decisionNodeSchema = baseNodeSchema.extend({
  condition: z.string().min(1, 'Condition is required'),
  branches: z.array(z.string()).min(2, 'At least two branches are required'),
  defaultBranch: z.string().optional(),
});

// Parallel Fork Node Schema - Fans out to concurrent branches
export const parallelForkNodeSchema = baseNodeSchema.extend({
  minBranches: z.number().int().min(2).default(2),
  description: z.string().default('Splits execution into parallel branches'),
});

// Parallel Join Node Schema - Waits for and merges incoming branches
export const parallelJoinNodeSchema = baseNodeSchema.extend({
  mergeStrategy: z.enum(['concat', 'merge', 'custom']).default('merge'),
  customMerger: z.string().optional(),
  waitForAll: z.boolean().default(true),
});

// Loop Node Schema - Creates cyclic edges until condition routes elsewhere
export const loopNodeSchema = baseNodeSchema.extend({
  condition: z.string().min(1, 'Loop condition is required'),
  maxIterations: z.number().int().positive().default(10),
  collectionKey: z.string().optional(),
  iteratorKey: z.string().optional(),
});

// Error-Retry Node Schema - Re-invokes previous node with configurable policy
export const errorRetryNodeSchema = baseNodeSchema.extend({
  maxRetries: z.number().int().positive().default(3),
  backoffType: z.enum(['constant', 'linear', 'exponential']).default('exponential'),
  initialDelayMs: z.number().int().positive().default(1000),
  maxDelayMs: z.number().int().positive().default(30000),
  jitter: z.boolean().default(true),
});

// Timeout Guard Node Schema - Interrupts long-running nodes after threshold
export const timeoutGuardNodeSchema = baseNodeSchema.extend({
  timeoutMs: z.number().int().positive().min(1000).default(60000),
  onTimeout: z.enum(['error', 'default', 'abort']).default('error'),
  defaultResult: z.string().optional(),
  heartbeatIntervalMs: z.number().int().positive().optional(),
});

// Human-Pause Node Schema - Pauses for human review/intervention
export const humanPauseNodeSchema = baseNodeSchema.extend({
  pauseMessage: z.string().default('Waiting for human input'),
  timeoutMs: z.number().int().positive().optional(),
  requiredFields: z.array(z.string()).optional(),
  allowEdits: z.boolean().default(true),
});

// Sub-graph Node Schema - Encapsulates an entire graph as a single node
export const subgraphNodeSchema = baseNodeSchema.extend({
  graphId: z.string().min(1, 'Graph ID is required'),
  version: z.string().default('latest'),
  inputMapping: z.record(z.string()).optional(),
  outputMapping: z.record(z.string()).optional(),
});

// Custom Node Schema - For any generic Python/JS function
export const customNodeSchema = baseNodeSchema.extend({
  functionBody: z.string().min(1, 'Function body is required'),
  inputSchema: z.string().optional(),
  outputSchema: z.string().optional(),
  language: z.enum(['python', 'javascript']).default('python'),
});

// Edge Schema with enhanced connection types
export const edgeSchema = z.object({
  // Basic edge properties
  condition: z.enum(['always', 'success', 'failure', 'custom']).default('always'),
  customCondition: z.string().optional(),
  animated: z.boolean().default(true),
  // Props for conditional edges from decision nodes
  branch: z.string().optional(),
  priority: z.number().int().min(0).optional(),
  // Props for parallel fork/join edges
  parallelBranch: z.boolean().optional(),
  // Props for retry policy
  isRetryEdge: z.boolean().optional(),
});

// Map of node types to their schemas
export const nodeTypeToSchema: Record<string, z.ZodObject<any>> = {
  startNode: startNodeSchema,
  endNode: endNodeSchema,
  agentNode: agentNodeSchema,
  toolNode: toolNodeSchema,
  memoryReadNode: memoryReadNodeSchema,
  memoryWriteNode: memoryWriteNodeSchema,
  decisionNode: decisionNodeSchema,
  parallelForkNode: parallelForkNodeSchema,
  parallelJoinNode: parallelJoinNodeSchema,
  loopNode: loopNodeSchema,
  errorRetryNode: errorRetryNodeSchema,
  timeoutGuardNode: timeoutGuardNodeSchema,
  humanPauseNode: humanPauseNodeSchema,
  subgraphNode: subgraphNodeSchema,
  customNode: customNodeSchema,
};

// Function to get the schema for a node type
export function getSchemaForNodeType(nodeType: string): z.ZodObject<any> {
  return nodeTypeToSchema[nodeType] || baseNodeSchema;
}

// Function to get the schema for an edge
export function getEdgeSchema(): z.ZodObject<any> {
  return edgeSchema;
}

// Edge validation rules
export function validateEdgeConnection(sourceType: string, targetType: string): boolean {
  // START nodes must not be the target of any edge
  if (targetType === 'startNode') {
    return false; // START nodes cannot have incoming edges
  }
  
  // START node can connect to any node type except itself
  if (sourceType === 'startNode') {
    return targetType !== 'startNode'; // Prevent self-loops
  }
  
  // END node cannot have outgoing edges
  if (sourceType === 'endNode') {
    return false;
  }
  
  // Parallel Fork must have at least two outgoing edges
  // This is handled in the graph validation logic, not in this edge validation function
  
  // Parallel Join must have at least two incoming edges
  // This is handled in the graph validation logic, not in this edge validation function
  
  // All other connections are allowed by default
  return true;
}

// Types derived from the schemas
export type BaseNodeData = z.infer<typeof baseNodeSchema>;
export type StartNodeData = z.infer<typeof startNodeSchema>;
export type EndNodeData = z.infer<typeof endNodeSchema>;
export type AgentNodeData = z.infer<typeof agentNodeSchema>;
export type ToolNodeData = z.infer<typeof toolNodeSchema>;
export type MemoryReadNodeData = z.infer<typeof memoryReadNodeSchema>;
export type MemoryWriteNodeData = z.infer<typeof memoryWriteNodeSchema>;
export type DecisionNodeData = z.infer<typeof decisionNodeSchema>;
export type ParallelForkNodeData = z.infer<typeof parallelForkNodeSchema>;
export type ParallelJoinNodeData = z.infer<typeof parallelJoinNodeSchema>;
export type LoopNodeData = z.infer<typeof loopNodeSchema>;
export type ErrorRetryNodeData = z.infer<typeof errorRetryNodeSchema>;
export type TimeoutGuardNodeData = z.infer<typeof timeoutGuardNodeSchema>;
export type HumanPauseNodeData = z.infer<typeof humanPauseNodeSchema>;
export type SubgraphNodeData = z.infer<typeof subgraphNodeSchema>;
export type CustomNodeData = z.infer<typeof customNodeSchema>;
export type EdgeData = z.infer<typeof edgeSchema>;
