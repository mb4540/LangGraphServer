"use client";

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useGraphStore from '@/store/graphStore';
import { Edge } from 'reactflow';
import { 
  getSchemaForNodeType, 
  getEdgeSchema,
  LLMNodeData,
  ToolNodeData,
  DecisionNodeData,
  EndNodeData,
  EdgeData
} from '@/utils/schemaUtils';

const DetailPanel: React.FC = () => {
  const { 
    selectedNodeId,
    selectedEdgeId, 
    nodes, 
    edges,
    updateNode,
    updateEdge
  } = useGraphStore();
  
  // Find the selected element (node or edge)
  const selectedNode = selectedNodeId ? nodes.find(node => node.id === selectedNodeId) : null;
  const selectedEdge = selectedEdgeId ? edges.find(edge => edge.id === selectedEdgeId) : null;
  
  // Setup react-hook-form
  const { 
    control, 
    handleSubmit, 
    reset, 
    setValue,
    formState: { errors } 
  } = useForm({
    resolver: selectedNode 
      ? zodResolver(getSchemaForNodeType(selectedNode.type)) 
      : selectedEdge 
        ? zodResolver(getEdgeSchema()) 
        : undefined,
    defaultValues: {},
  });
  
  // Reset form when selection changes
  useEffect(() => {
    if (selectedNode) {
      // For nodes, reset with current node data
      reset({ ...selectedNode.data });
    } else if (selectedEdge) {
      // For edges, reset with current edge data or defaults
      reset({ 
        condition: selectedEdge.data?.condition || 'always',
        customCondition: selectedEdge.data?.customCondition || '',
        animated: selectedEdge.animated || true
      });
    }
  }, [selectedNode, selectedEdge, reset]);
  
  // Handle form submission (mainly used for validation)
  const onSubmit = (data: any) => {
    if (selectedNode) {
      updateNode(selectedNode.id, { data });
    } else if (selectedEdge) {
      updateEdge(selectedEdge.id, { data });
    }
  };
  
  // Update on field blur to make changes immediate
  const handleFieldBlur = (name: string, value: any) => {
    if (selectedNode) {
      const updatedData = { ...selectedNode.data, [name]: value };
      updateNode(selectedNode.id, { data: updatedData });
    } else if (selectedEdge) {
      const updatedData = { ...selectedEdge.data, [name]: value };
      updateEdge(selectedEdge.id, { data: updatedData });
    }
  };
  
  // Render form fields based on node type
  const renderNodeFields = () => {
    if (!selectedNode) return null;
    
    switch (selectedNode.type) {
      case 'agentNode':
        return (
          <>
            <div className="bg-purple-50 p-3 mb-4 rounded-md border border-purple-200">
              <h3 className="font-medium text-purple-800 flex items-center">
                <span className="mr-2 bg-purple-500 text-white px-2 py-0.5 text-xs rounded-full">
                  {selectedNode.data.agentType?.toUpperCase() || 'AGENT'}
                </span>
                Agent Node Configuration
              </h3>
              <p className="text-xs text-gray-700 mt-1">
                Agent nodes wrap LLMs with complex behaviors like tool-calling and reasoning.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent Type</label>
              <Controller
                name="agentType"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('agentType', e.target.value);
                    }}
                  >
                    <option value="llm">Basic LLM</option>
                    <option value="react">ReAct (Tool Calling)</option>
                    <option value="planAndExecute">Plan and Execute</option>
                  </select>
                )}
              />
              {errors.agentType && (
                <span className="text-red-500 text-xs">{errors.agentType.message as string}</span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Different agent types have distinct behaviors and capabilities.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
              <Controller
                name="modelName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="e.g., gpt-4, gpt-3.5-turbo, anthropic/claude-3"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('modelName', e.target.value);
                    }}
                  />
                )}
              />
              {errors.modelName && (
                <span className="text-red-500 text-xs">{errors.modelName.message as string}</span>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
              <Controller
                name="temperature"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      field.onChange(value);
                    }}
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('temperature', parseFloat(e.target.value));
                    }}
                  />
                )}
              />
              {errors.temperature && (
                <span className="text-red-500 text-xs">{errors.temperature.message as string}</span>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
              <Controller
                name="maxTokens"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    min="1"
                    max="32000"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      field.onChange(value);
                    }}
                    onBlur={(e) => {
                      field.onBlur();
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      handleFieldBlur('maxTokens', value);
                    }}
                  />
                )}
              />
              {errors.maxTokens && (
                <span className="text-red-500 text-xs">{errors.maxTokens.message as string}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available Tools</label>
              <Controller
                name="tools"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder="Enter tool names separated by commas"
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onChange={(e) => {
                      // Split by commas and trim whitespace
                      const toolsList = e.target.value
                        .split(',')
                        .map(tool => tool.trim())
                        .filter(tool => tool.length > 0);
                      field.onChange(toolsList);
                    }}
                    value={field.value ? field.value.join(', ') : ''}
                    onBlur={(e) => {
                      field.onBlur();
                      const toolsList = e.target.value
                        .split(',')
                        .map(tool => tool.trim())
                        .filter(tool => tool.length > 0);
                      handleFieldBlur('tools', toolsList);
                    }}
                  />
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                For ReAct agents, specify which tools this agent can use.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
              <Controller
                name="systemPrompt"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={5}
                    placeholder="Instructions for the agent"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('systemPrompt', e.target.value);
                    }}
                  />
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                System instructions that define how the agent behaves and processes input.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stop Condition</label>
              <Controller
                name="stopCondition"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Optional stopping criteria"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('stopCondition', e.target.value);
                    }}
                  />
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional condition that determines when to stop agent execution.
              </p>
            </div>
          </>
        );
        
      case 'llmNode':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
              <Controller
                name="modelName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('modelName', e.target.value);
                    }}
                  />
                )}
              />
              {errors.modelName && (
                <span className="text-red-500 text-xs">{errors.modelName.message as string}</span>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
              <Controller
                name="temperature"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      field.onChange(value);
                    }}
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('temperature', parseFloat(e.target.value));
                    }}
                  />
                )}
              />
              {errors.temperature && (
                <span className="text-red-500 text-xs">{errors.temperature.message as string}</span>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
              <Controller
                name="maxTokens"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    min="1"
                    max="32000"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      field.onChange(value);
                    }}
                    onBlur={(e) => {
                      field.onBlur();
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      handleFieldBlur('maxTokens', value);
                    }}
                  />
                )}
              />
              {errors.maxTokens && (
                <span className="text-red-500 text-xs">{errors.maxTokens.message as string}</span>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
              <Controller
                name="systemPrompt"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('systemPrompt', e.target.value);
                    }}
                  />
                )}
              />
            </div>
          </>
        );
      
      case 'toolNode':
        return (
          <>
            <div className="bg-green-50 p-3 mb-4 rounded-md border border-green-200">
              <h3 className="font-medium text-green-800 flex items-center">
                <span className="mr-2 bg-green-500 text-white px-2 py-0.5 text-xs rounded-full">TOOL</span>
                Tool Node Configuration
              </h3>
              <p className="text-xs text-gray-700 mt-1">
                Tool nodes execute external functions with concurrency and error handling capabilities.
              </p>
            </div>
          
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Module Path</label>
              <Controller
                name="modulePath"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="e.g., app.tools.file_tools"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('modulePath', e.target.value);
                    }}
                  />
                )}
              />
              {errors.modulePath && (
                <span className="text-red-500 text-xs">{errors.modulePath.message as string}</span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Python import path to the module containing the tool function.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Function Name</label>
              <Controller
                name="functionName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="e.g., read_file"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('functionName', e.target.value);
                    }}
                  />
                )}
              />
              {errors.functionName && (
                <span className="text-red-500 text-xs">{errors.functionName.message as string}</span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Name of the function to call from the module.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Args Schema (JSON)</label>
              <Controller
                name="argsSchema"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={4}
                    placeholder="JSON schema defining the function parameters"
                    className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('argsSchema', e.target.value);
                    }}
                  />
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional JSON schema for function arguments validation.
              </p>
            </div>
            
            <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
              <h4 className="text-sm font-medium text-green-800 mb-2">Concurrency & Performance</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Concurrency</label>
                <Controller
                  name="concurrency"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      min="1"
                      max="50"
                      placeholder="1"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : 1;
                        field.onChange(value);
                      }}
                      onBlur={(e) => {
                        field.onBlur();
                        const value = e.target.value ? parseInt(e.target.value) : 1;
                        handleFieldBlur('concurrency', value);
                      }}
                    />
                  )}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of concurrent executions allowed. Higher values improve throughput for I/O-bound operations.
                </p>
              </div>
              
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeout (ms)</label>
                <Controller
                  name="timeout"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      min="0"
                      placeholder="30000"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : undefined;
                        field.onChange(value);
                      }}
                      onBlur={(e) => {
                        field.onBlur();
                        const value = e.target.value ? parseInt(e.target.value) : undefined;
                        handleFieldBlur('timeout', value);
                      }}
                    />
                  )}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum execution time in milliseconds before the tool call is aborted.
                </p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
              <h4 className="text-sm font-medium text-green-800 mb-2">Error Handling</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Error Strategy</label>
                <Controller
                  name="errorHandling"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      onBlur={(e) => {
                        field.onBlur();
                        handleFieldBlur('errorHandling', e.target.value);
                      }}
                    >
                      <option value="fail">Fail (propagate error)</option>
                      <option value="ignore">Ignore (continue execution)</option>
                      <option value="retry">Retry (attempt again)</option>
                    </select>
                  )}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Determines how errors are handled during tool execution.
                </p>
              </div>
              
              {selectedNode.data.errorHandling === 'retry' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Retries</label>
                  <Controller
                    name="maxRetries"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        min="0"
                        max="10"
                        placeholder="3"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : 3;
                          field.onChange(value);
                        }}
                        onBlur={(e) => {
                          field.onBlur();
                          const value = e.target.value ? parseInt(e.target.value) : 3;
                          handleFieldBlur('maxRetries', value);
                        }}
                      />
                    )}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum number of retry attempts before giving up.
                  </p>
                </div>
              )}
            </div>
          </>
        );
        
      case 'decisionNode':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <Controller
                name="condition"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('condition', e.target.value);
                    }}
                  />
                )}
              />
              {errors.condition && (
                <span className="text-red-500 text-xs">{errors.condition.message as string}</span>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branches (comma-separated)</label>
              <Controller
                name="branches"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                    onChange={(e) => {
                      const branches = e.target.value 
                        ? e.target.value.split(',').map(b => b.trim()) 
                        : [];
                      field.onChange(branches);
                    }}
                    onBlur={(e) => {
                      field.onBlur();
                      const branches = e.target.value 
                        ? e.target.value.split(',').map(b => b.trim()) 
                        : [];
                      handleFieldBlur('branches', branches);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              />
            </div>
          </>
        );
        
      case 'endNode':
        return (
          <>
            <div className="bg-red-50 p-3 mb-4 rounded-md border border-red-200">
              <h3 className="font-medium text-red-800 flex items-center">
                <span className="mr-2 bg-red-500 text-white px-2 py-0.5 text-xs rounded-full">END</span>
                Terminal Node Configuration
              </h3>
              <p className="text-xs text-gray-700 mt-1">
                END nodes mark successful graph termination and format the final output.
              </p>
            </div>
          
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
              <Controller
                name="outputFormat"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('outputFormat', e.target.value);
                    }}
                  >
                    <option value="text">Text</option>
                    <option value="json">JSON</option>
                    <option value="markdown">Markdown</option>
                  </select>
                )}
              />
              {errors.outputFormat && (
                <span className="text-red-500 text-xs">{errors.outputFormat.message as string}</span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Determines how the final output is formatted when the graph completes.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Final Transform</label>
              <Controller
                name="finalTransform"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder="Optional transformation to apply to the final output"
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('finalTransform', e.target.value);
                    }}
                  />
                )}
              />
              {errors.finalTransform && (
                <span className="text-red-500 text-xs">{errors.finalTransform.message as string}</span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Optional code or expression to transform the output before returning.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder="Describe this END node's purpose"
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('description', e.target.value);
                    }}
                  />
                )}
              />
            </div>
          </>
        );
      
      default:
        return (
          <div className="text-sm text-gray-500">
            No specific properties for this node type.
          </div>
        );
    }
  };
  
  // Render edge properties form
  const renderEdgeFields = () => {
    if (!selectedEdge) return null;
    
    return (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Condition Type</label>
          <Controller
            name="condition"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onBlur={(e) => {
                  field.onBlur();
                  handleFieldBlur('condition', e.target.value);
                }}
              >
                <option value="always">Always</option>
                <option value="success">On Success</option>
                <option value="failure">On Failure</option>
                <option value="custom">Custom Expression</option>
              </select>
            )}
          />
        </div>
        
        {/* Show custom condition field only when condition type is 'custom' */}
        <Controller
          name="condition"
          control={control}
          render={({ field }) => (
            <>
              {field.value === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom Condition</label>
                  <Controller
                    name="customCondition"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onBlur={(e) => {
                          field.onBlur();
                          handleFieldBlur('customCondition', e.target.value);
                        }}
                      />
                    )}
                  />
                </div>
              )}
            </>
          )}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Animated</label>
          <Controller
            name="animated"
            control={control}
            render={({ field }) => (
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => {
                  field.onChange(e.target.checked);
                  handleFieldBlur('animated', e.target.checked);
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            )}
          />
        </div>
      </>
    );
  };

  // Provide a basic form for node properties
  const renderBasicNodeInfo = () => {
    if (!selectedNode) return null;
    
    return (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Node ID</label>
          <div className="p-2 bg-gray-50 rounded border border-gray-200 text-gray-600 text-sm">{selectedNode.id}</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <div className="p-2 bg-gray-50 rounded border border-gray-200 text-gray-600 text-sm">{selectedNode.type}</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
          <Controller
            name="label"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onBlur={(e) => {
                  field.onBlur();
                  handleFieldBlur('label', e.target.value);
                }}
              />
            )}
          />
          {errors.label && (
            <span className="text-red-500 text-xs">{errors.label.message as string}</span>
          )}
        </div>
      </>
    );
  };
  
  // Render edge basic info
  const renderBasicEdgeInfo = () => {
    if (!selectedEdge) return null;
    
    return (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Edge ID</label>
          <div className="p-2 bg-gray-50 rounded border border-gray-200 text-gray-600 text-sm">{selectedEdge.id}</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
          <div className="p-2 bg-gray-50 rounded border border-gray-200 text-gray-600 text-sm">{selectedEdge.source}</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
          <div className="p-2 bg-gray-50 rounded border border-gray-200 text-gray-600 text-sm">{selectedEdge.target}</div>
        </div>
        
        {selectedEdge.sourceHandle && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source Handle</label>
            <div className="p-2 bg-gray-50 rounded border border-gray-200 text-gray-600 text-sm">{selectedEdge.sourceHandle}</div>
          </div>
        )}
        
        {selectedEdge.targetHandle && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Handle</label>
            <div className="p-2 bg-gray-50 rounded border border-gray-200 text-gray-600 text-sm">{selectedEdge.targetHandle}</div>
          </div>
        )}
      </>
    );
  };
  
  return (
    <div className="h-full flex flex-col bg-white shadow-inner overflow-auto">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">
          {selectedNode ? 'Node Properties' : selectedEdge ? 'Edge Properties' : 'Detail Panel'}
        </h2>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {selectedNode || selectedEdge ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Render basic info about the element */}
            {selectedNode && renderBasicNodeInfo()}
            {selectedEdge && renderBasicEdgeInfo()}
            
            {/* Horizontal divider */}
            {(selectedNode || selectedEdge) && (
              <div className="border-t border-gray-200 my-4" />
            )}
            
            {/* Render type-specific fields */}
            {selectedNode && renderNodeFields()}
            {selectedEdge && renderEdgeFields()}
          </form>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a node or edge to view details
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailPanel;
