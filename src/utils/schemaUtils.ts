import { z } from 'zod';

// Base node data schema that all nodes will extend
export const baseNodeSchema = z.object({
  label: z.string().min(1, 'Label is required'),
});

// LLM Node Schema
export const llmNodeSchema = baseNodeSchema.extend({
  modelName: z.string().min(1, 'Model name is required'),
  temperature: z.number().min(0).max(1).default(0.7),
  maxTokens: z.number().int().positive().max(32000).optional(),
  systemPrompt: z.string().optional(),
});

// Tool Node Schema
export const toolNodeSchema = baseNodeSchema.extend({
  modulePath: z.string().min(1, 'Module path is required'),
  functionName: z.string().min(1, 'Function name is required'),
  argsSchema: z.string().optional(),
  timeout: z.number().int().positive().optional(),
});

// Decision Node Schema
export const decisionNodeSchema = baseNodeSchema.extend({
  condition: z.string().min(1, 'Condition is required'),
  branches: z.array(z.string()).optional(),
});

// End Node Schema
export const endNodeSchema = baseNodeSchema.extend({
  outputFormat: z.enum(['json', 'text', 'markdown']).default('text'),
  finalTransform: z.string().optional(),
});

// Edge Schema
export const edgeSchema = z.object({
  condition: z.enum(['always', 'success', 'failure', 'custom']).default('always'),
  customCondition: z.string().optional(),
  animated: z.boolean().default(true),
});

// Map of node types to their schemas
export const nodeTypeToSchema: Record<string, z.ZodObject<any>> = {
  llmNode: llmNodeSchema,
  toolNode: toolNodeSchema,
  decisionNode: decisionNodeSchema,
  endNode: endNodeSchema,
};

// Function to get the schema for a node type
export function getSchemaForNodeType(nodeType: string): z.ZodObject<any> {
  return nodeTypeToSchema[nodeType] || baseNodeSchema;
}

// Function to get the schema for an edge
export function getEdgeSchema(): z.ZodObject<any> {
  return edgeSchema;
}

// Types derived from the schemas
export type BaseNodeData = z.infer<typeof baseNodeSchema>;
export type LLMNodeData = z.infer<typeof llmNodeSchema>;
export type ToolNodeData = z.infer<typeof toolNodeSchema>;
export type DecisionNodeData = z.infer<typeof decisionNodeSchema>;
export type EndNodeData = z.infer<typeof endNodeSchema>;
export type EdgeData = z.infer<typeof edgeSchema>;
