"use client";

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconRefresh, IconAlertTriangle, IconClock, IconUser } from '@/components/ui/icons';
import useGraphStore from '@/store/graphStore';
import { Edge } from 'reactflow';
import { 
  getSchemaForNodeType, 
  getEdgeSchema,
  LLMNodeData,
  ToolNodeData,
  DecisionNodeData,
  EndNodeData,
  EdgeData,
  HumanPauseNodeData
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
    watch,
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Evaluation Mode</label>
              <Controller
                name="evaluationMode"
                control={control}
                render={({ field }) => (
                  <div className="flex">{/* Mode tabs */}
                    <button
                      type="button"
                      className={`px-4 py-2 flex-1 ${field.value === 'simple' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-l-md`}
                      onClick={() => {
                        field.onChange('simple');
                        handleFieldChange('evaluationMode', 'simple');
                      }}
                    >
                      Simple
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 flex-1 ${field.value === 'advanced' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-r-md`}
                      onClick={() => {
                        field.onChange('advanced');
                        handleFieldChange('evaluationMode', 'advanced');
                      }}
                    >
                      Advanced
                    </button>
                  </div>
                )}
              />
              
              <div className="mt-1 text-xs text-gray-500">
                {watch('evaluationMode') === 'simple' 
                  ? 'Simple mode uses a basic condition to choose between fixed branches.' 
                  : 'Advanced mode allows multiple predicates for sophisticated routing logic.'
                }
              </div>
            </div>
            
            {/* Simple mode fields */}
            {watch('evaluationMode') === 'simple' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <Controller
                    name="condition"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={3}
                        placeholder="Simple condition that will be used for routing logic"
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
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branches (comma-separated)</label>
                  <Controller
                    name="branches"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="text"
                        value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                        placeholder="E.g., true, false, error"
                        onChange={(e) => {
                          const branches = e.target.value 
                            ? e.target.value.split(',').map(b => b.trim()) 
                            : [];
                          field.onChange(branches);
                          handleFieldChange('branches', branches);
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  />
                  {errors.branches && (
                    <span className="text-red-500 text-xs">{errors.branches.message as string}</span>
                  )}
                </div>
              </>
            )}

            {/* Advanced mode fields */}
            {watch('evaluationMode') === 'advanced' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Predicates</label>
                <Controller
                  name="predicates"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-3">
                      {Array.isArray(field.value) && field.value.map((predicate, index) => (
                        <div key={index} className="p-3 border border-gray-300 rounded-md bg-gray-50">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium">Predicate {index + 1}</label>
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => {
                                const newPredicates = [...field.value];
                                newPredicates.splice(index, 1);
                                field.onChange(newPredicates);
                                handleFieldChange('predicates', newPredicates);
                              }}
                            >
                              Remove
                            </button>
                          </div>
                          
                          <div className="mb-2">
                            <label className="block text-xs text-gray-600 mb-1">Name</label>
                            <input
                              type="text"
                              value={predicate.name || ''}
                              placeholder="success, error, needs_info"
                              onChange={(e) => {
                                const newPredicates = [...field.value];
                                newPredicates[index] = {
                                  ...newPredicates[index],
                                  name: e.target.value
                                };
                                field.onChange(newPredicates);
                                handleFieldChange('predicates', newPredicates);
                              }}
                              className="w-full p-2 text-sm border border-gray-300 rounded-md"
                            />
                          </div>
                          
                          <div className="mb-2">
                            <label className="block text-xs text-gray-600 mb-1">Expression</label>
                            <textarea
                              value={predicate.expression || ''}
                              placeholder="state['output'] and 'success' in state['output']"
                              onChange={(e) => {
                                const newPredicates = [...field.value];
                                newPredicates[index] = {
                                  ...newPredicates[index],
                                  expression: e.target.value
                                };
                                field.onChange(newPredicates);
                                handleFieldChange('predicates', newPredicates);
                              }}
                              rows={2}
                              className="w-full p-2 text-sm border border-gray-300 rounded-md"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Description (optional)</label>
                            <input
                              type="text"
                              value={predicate.description || ''}
                              placeholder="Routes when the task is successful"
                              onChange={(e) => {
                                const newPredicates = [...field.value];
                                newPredicates[index] = {
                                  ...newPredicates[index],
                                  description: e.target.value
                                };
                                field.onChange(newPredicates);
                                handleFieldChange('predicates', newPredicates);
                              }}
                              className="w-full p-2 text-sm border border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        className="w-full p-2 border border-dashed border-gray-300 rounded-md text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => {
                          const currentPredicates = Array.isArray(field.value) ? field.value : [];
                          const newPredicates = [
                            ...currentPredicates,
                            { name: '', expression: '', description: '' }
                          ];
                          field.onChange(newPredicates);
                          handleFieldChange('predicates', newPredicates);
                        }}
                      >
                        + Add Predicate
                      </button>
                      
                      {errors.predicates && (
                        <span className="text-red-500 text-xs block mt-1">{errors.predicates.message as string}</span>
                      )}
                    </div>
                  )}
                />
              </div>
            )}
            
            {/* Default branch field (for both modes) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Branch (optional)</label>
              <Controller
                name="defaultBranch"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    {...field}
                    placeholder="Name of the default branch"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('defaultBranch', e.target.value);
                    }}
                  />
                )}
              />
              <div className="mt-1 text-xs text-gray-500">
                If no condition matches, the flow will route to this branch.
              </div>
            </div>
          </>
        );
        
      case 'endNode':
        return (
          <>
            <div className="bg-red-50 p-3 mb-4 rounded-md border border-red-200">
              <h3 className="font-medium text-red-800 flex items-center">
                <span className="mr-2 bg-red-500 text-white px-2 py-0.5 text-xs rounded-full">END</span>
                End Node Configuration
              </h3>
              <p className="text-xs text-gray-700 mt-1">
                End nodes terminate graph execution and return the final output.
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
                    <option value="json">JSON</option>
                    <option value="text">Text</option>
                    <option value="binary">Binary</option>
                  </select>
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Final Transform</label>
              <Controller
                name="finalTransform"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    placeholder="Optional JavaScript expression to transform the output"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('finalTransform', e.target.value);
                    }}
                  />
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional JavaScript expression to transform the output before returning. Access the output with the 'result' variable.
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
      
      case 'memoryReadNode':
        return (
          <>
            <div className="bg-cyan-50 p-3 mb-4 rounded-md border border-cyan-200">
              <h3 className="font-medium text-cyan-800 flex items-center">
                <span className="mr-2 bg-cyan-500 text-white px-2 py-0.5 text-xs rounded-full">READ</span>
                Memory Read Node
              </h3>
              <p className="text-xs text-gray-700 mt-1">
                Memory Read nodes retrieve data from short-term or long-term memory stores.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Memory Type</label>
              <Controller
                name="memoryType"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('memoryType', e.target.value);
                    }}
                  >
                    <option value="short_term">Short-term (Current Thread)</option>
                    <option value="long_term">Long-term (Persistent)</option>
                  </select>
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                Short-term memory only persists during graph execution, while long-term memory is persistent across runs.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Memory Key</label>
              <Controller
                name="key"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="e.g., user_profile, conversation_history"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('key', e.target.value);
                    }}
                  />
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                The key used to identify the memory. Leave empty to retrieve all memory.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Namespace</label>
              <Controller
                name="namespace"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="e.g., user_123, session_456"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('namespace', e.target.value);
                    }}
                  />
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional namespace to organize memories. Useful for multi-tenant applications.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Expression</label>
              <Controller
                name="filter"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    placeholder="Optional JavaScript expression to filter memories"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('filter', e.target.value);
                    }}
                  />
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional expression to filter memories. Access the memory with the 'memory' variable.
              </p>
            </div>
          </>
        );
        
      case 'memoryWriteNode':
        return (
          <>
            <div className="bg-teal-50 p-3 mb-4 rounded-md border border-teal-200">
              <h3 className="font-medium text-teal-800 flex items-center">
                <span className="mr-2 bg-teal-500 text-white px-2 py-0.5 text-xs rounded-full">WRITE</span>
                Memory Write Node
              </h3>
              <p className="text-xs text-gray-700 mt-1">
                Memory Write nodes store data in short-term or long-term memory.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Memory Type</label>
              <Controller
                name="memoryType"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('memoryType', e.target.value);
                    }}
                  >
                    <option value="short_term">Short-term (Current Thread)</option>
                    <option value="long_term">Long-term (Persistent)</option>
                  </select>
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                Short-term memory only persists during graph execution, while long-term memory is persistent across runs.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Memory Key</label>
              <Controller
                name="key"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="e.g., user_profile, conversation_history"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('key', e.target.value);
                    }}
                  />
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                The key used to identify the memory.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Namespace</label>
              <Controller
                name="namespace"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="e.g., user_123, session_456"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('namespace', e.target.value);
                    }}
                  />
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional namespace to organize memories. Useful for multi-tenant applications.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Storage Format</label>
              <Controller
                name="storageFormat"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('storageFormat', e.target.value);
                    }}
                  >
                    <option value="json">JSON</option>
                    <option value="text">Text</option>
                    <option value="binary">Binary</option>
                  </select>
                )}
              />
            </div>
            
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Time-to-Live (TTL) in seconds</label>
              <Controller
                name="ttl"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    min="0"
                    placeholder="Leave empty for no expiration"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      field.onChange(value);
                    }}
                    onBlur={(e) => {
                      field.onBlur();
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      handleFieldBlur('ttl', value);
                    }}
                  />
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional time-to-live in seconds. After this period, the memory will be automatically deleted. Only applicable for long-term memory.
              </p>
            </div>
            
            <div className="mt-3">
              <Controller
                name="overwriteExisting"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center">
                    <input
                      id="overwriteExisting"
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.checked);
                        handleFieldBlur('overwriteExisting', e.target.checked);
                      }}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor="overwriteExisting" className="ml-2 block text-sm text-gray-700">
                      Overwrite existing memory if key exists
                    </label>
                  </div>
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                If unchecked, the node will append to existing memory instead of overwriting it.
              </p>
            </div>
          </>
        );

      case 'parallelForkNode':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Branches</label>
              <Controller
                name="minBranches"
                control={control}
                render={({ field }) => (
                  <input
                    type="number"
                    min="2"
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (value >= 2) {
                        field.onChange(value);
                        handleFieldChange('minBranches', value);
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              />
              {errors.minBranches && (
                <span className="text-red-500 text-xs">{errors.minBranches.message as string}</span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Minimum number of concurrent branches (at least 2)
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={2}
                    placeholder="Describe the purpose of this parallel fork node"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('description', e.target.value);
                    }}
                  />
                )}
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-md border border-blue-200 text-sm text-blue-700 mb-4">
              <p className="font-medium mb-1">How to use Parallel Fork</p>
              <ul className="list-disc list-inside text-xs space-y-1">
                <li>Connect inputs to the top handle</li>
                <li>Connect outputs from each bottom handle to different nodes</li>
                <li>Each branch will execute concurrently</li>
                <li>Use a Parallel Join node to merge results</li>
              </ul>
            </div>
          </>
        );
        
      case 'parallelJoinNode':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Merge Strategy</label>
              <Controller
                name="mergeStrategy"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleFieldChange('mergeStrategy', e.target.value);
                    }}
                  >
                    <option value="merge">Merge (combine objects)</option>
                    <option value="concat">Concatenate (join text/lists)</option>
                    <option value="custom">Custom (define a merger function)</option>
                  </select>
                )}
              />
              {errors.mergeStrategy && (
                <span className="text-red-500 text-xs">{errors.mergeStrategy.message as string}</span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                How to combine results from parallel branches
              </p>
            </div>

            {watch('mergeStrategy') === 'custom' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Merger Function</label>
                <Controller
                  name="customMerger"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={4}
                      placeholder="def custom_merger(results):
    # Combine results here
    return combined_result"
                      className="w-full p-2 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onBlur={(e) => {
                        field.onBlur();
                        handleFieldBlur('customMerger', e.target.value);
                      }}
                    />
                  )}
                />
                {errors.customMerger && (
                  <span className="text-red-500 text-xs">{errors.customMerger.message as string}</span>
                )}
              </div>
            )}

            <div className="mb-4">
              <Controller
                name="waitForAll"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="waitForAllCheckbox"
                      checked={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.checked);
                        handleFieldChange('waitForAll', e.target.checked);
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="waitForAllCheckbox" className="ml-2 block text-sm font-medium text-gray-700">
                      Wait for all branches to complete
                    </label>
                  </div>
                )}
              />
              <p className="text-xs text-gray-500 mt-1 ml-6">
                If unchecked, the node will process each result as it arrives
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={2}
                    placeholder="Describe how this join node combines results"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('description', e.target.value);
                    }}
                  />
                )}
              />
            </div>

            <div className="p-3 bg-indigo-50 rounded-md border border-indigo-200 text-sm text-indigo-700">
              <p className="font-medium mb-1">How to use Parallel Join</p>
              <ul className="list-disc list-inside text-xs space-y-1">
                <li>Connect all parallel branches to the top handles</li>
                <li>Results will be automatically combined using the selected merge strategy</li>
                <li>Connect the bottom handle to the next step in your workflow</li>
              </ul>
            </div>
          </>
        );
        
      case 'loopNode':
        return (
          <>
            <div className="p-3 bg-amber-50 rounded-md border border-amber-200 text-sm text-amber-800 mb-4">
              <h3 className="font-medium flex items-center">
                <IconRefresh className="h-4 w-4 mr-1" />
                Loop Node
              </h3>
              <p className="text-xs text-gray-700 mt-1">
                Loop nodes create cyclic patterns with conditional exit criteria.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Loop Condition</label>
              <Controller
                name="condition"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={2}
                    placeholder="Enter condition to evaluate for continuing the loop"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
              <p className="text-xs text-gray-500 mt-1">
                Expression that evaluates to true to continue the loop, false to exit
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Iterations</label>
              <Controller
                name="maxIterations"
                control={control}
                render={({ field }) => (
                  <input
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (value >= 1) {
                        field.onChange(value);
                        handleFieldChange('maxIterations', value);
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                )}
              />
              {errors.maxIterations && (
                <span className="text-red-500 text-xs">{errors.maxIterations.message as string}</span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Safety limit to prevent infinite loops (0 or empty for no limit)
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Collection Key (Optional)</label>
              <Controller
                name="collectionKey"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    {...field}
                    placeholder="Key in state that contains iterable collection"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('collectionKey', e.target.value);
                    }}
                  />
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                For iterating over a collection (if used, will override condition)
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Iterator Key (Optional)</label>
              <Controller
                name="iteratorKey"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    {...field}
                    placeholder="Key to store current item during iteration"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('iteratorKey', e.target.value);
                    }}
                  />
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                Where to store the current item when iterating over a collection
              </p>
            </div>
            
            <div className="p-3 bg-amber-50 rounded-md border border-amber-200 text-sm text-amber-700">
              <p className="font-medium mb-1">How to use Loop Node</p>
              <ul className="list-disc list-inside text-xs space-y-1">
                <li>Connect input to the top handle</li>
                <li>Connect the <span className="text-green-600 font-medium">continue</span> handle to nodes inside the loop</li>
                <li>Connect the <span className="text-red-600 font-medium">exit</span> handle to nodes after the loop</li>
                <li>The loop will continue until your condition returns false</li>
                <li>Use max iterations to prevent infinite loops</li>
              </ul>
            </div>
          </>
        );

      case 'errorRetryNode':
        return (
          <>
            <div className="p-3 bg-orange-50 rounded-md border border-orange-200 text-sm text-orange-800 mb-4">
              <h3 className="font-medium flex items-center">
                <IconAlertTriangle className="h-4 w-4 mr-1" />
                Error Retry Node
              </h3>
              <p className="text-xs text-gray-700 mt-1">
                Error Retry nodes automatically reattempt operations that fail with configurable backoff policies.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Retries</label>
              <Controller
                name="maxRetries"
                control={control}
                render={({ field }) => (
                  <input
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (value >= 1) {
                        field.onChange(value);
                        handleFieldChange('maxRetries', value);
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                )}
              />
              {errors.maxRetries && (
                <span className="text-red-500 text-xs">{errors.maxRetries.message as string}</span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Maximum number of retry attempts before failing
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Backoff Type</label>
              <Controller
                name="backoffType"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleFieldChange('backoffType', e.target.value);
                    }}
                  >
                    <option value="constant">Constant (fixed delay)</option>
                    <option value="linear">Linear (increases linearly)</option>
                    <option value="exponential">Exponential (doubles each retry)</option>
                  </select>
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                How delay should increase between retry attempts
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Delay (ms)</label>
              <Controller
                name="initialDelayMs"
                control={control}
                render={({ field }) => (
                  <input
                    type="number"
                    min="100"
                    step="100"
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (value >= 100) {
                        field.onChange(value);
                        handleFieldChange('initialDelayMs', value);
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                Delay in milliseconds before the first retry
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Delay (ms)</label>
              <Controller
                name="maxDelayMs"
                control={control}
                render={({ field }) => (
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (value >= 1000) {
                        field.onChange(value);
                        handleFieldChange('maxDelayMs', value);
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum delay in milliseconds between retries
              </p>
            </div>
            
            <div className="mb-4">
              <Controller
                name="jitter"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="jitterCheckbox"
                      checked={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.checked);
                        handleFieldChange('jitter', e.target.checked);
                      }}
                      className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="jitterCheckbox" className="ml-2 block text-sm font-medium text-gray-700">
                      Add jitter to delays
                    </label>
                  </div>
                )}
              />
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Add randomness to retry delays to prevent thundering herd problem
              </p>
            </div>
            
            <div className="p-3 bg-orange-50 rounded-md border border-orange-200 text-sm text-orange-700">
              <p className="font-medium mb-1">How to use Error Retry</p>
              <ul className="list-disc list-inside text-xs space-y-1">
                <li>Connect input to the operation that might fail</li>
                <li>Connect <span className="text-orange-600 font-medium">should_retry</span> handle back to the operation for retry flow</li>
                <li>Connect <span className="text-green-600 font-medium">continue</span> handle to next steps when retries succeed or are exhausted</li>
                <li>The state will include retry information you can use for logging and debugging</li>
              </ul>
            </div>
          </>
        );
        
      case 'timeoutGuardNode':
        return (
          <>
            <div className="p-3 bg-purple-50 rounded-md border border-purple-200 text-sm text-purple-800 mb-4">
              <h3 className="font-medium flex items-center">
                <IconClock className="h-4 w-4 mr-1" />
                Timeout Guard Node
              </h3>
              <p className="text-xs text-gray-700 mt-1">
                Timeout Guard nodes protect against long-running operations by setting time limits.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeout (ms)</label>
              <Controller
                name="timeoutMs"
                control={control}
                render={({ field }) => (
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (value >= 1000) {
                        field.onChange(value);
                        handleFieldChange('timeoutMs', value);
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                )}
              />
              {errors.timeoutMs && (
                <span className="text-red-500 text-xs">{errors.timeoutMs.message as string}</span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Maximum execution time in milliseconds
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">On Timeout Action</label>
              <Controller
                name="onTimeout"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleFieldChange('onTimeout', e.target.value);
                    }}
                  >
                    <option value="error">Error (raise exception)</option>
                    <option value="default">Default (use fallback value)</option>
                    <option value="abort">Abort (terminate workflow)</option>
                  </select>
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                What action to take when timeout is reached
              </p>
            </div>
            
            {watch('onTimeout') === 'default' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Result</label>
                <Controller
                  name="defaultResult"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={2}
                      placeholder="Default value to use when timeout occurs"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      onBlur={(e) => {
                        field.onBlur();
                        handleFieldBlur('defaultResult', e.target.value);
                      }}
                    />
                  )}
                />
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Heartbeat Interval (ms)</label>
              <Controller
                name="heartbeatIntervalMs"
                control={control}
                render={({ field }) => (
                  <input
                    type="number"
                    min="100"
                    step="100"
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!value || value >= 100) {
                        field.onChange(value || undefined);
                        handleFieldChange('heartbeatIntervalMs', value || undefined);
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Interval for operation to report progress (prevents timeout if heartbeat is received)
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-md border border-purple-200 text-sm text-purple-700">
              <p className="font-medium mb-1">How to use Timeout Guard</p>
              <ul className="list-disc list-inside text-xs space-y-1">
                <li>Connect input to the top handle</li>
                <li>Connect the <span className="text-green-600 font-medium">normal</span> handle to flow when execution completes in time</li>
                <li>Connect the <span className="text-red-600 font-medium">expired</span> handle to fallback logic when timeout occurs</li>
                <li>For long-running tasks, set an appropriate heartbeat interval</li>
              </ul>
            </div>
          </>
        );

      case 'humanPauseNode':
        return (
          <>
            <div className="p-3 bg-blue-50 rounded-md border border-blue-200 text-sm text-blue-800 mb-4">
              <h3 className="font-medium flex items-center">
                <IconUser className="h-4 w-4 mr-1" />
                Human Pause Node
              </h3>
              <p className="text-xs text-gray-700 mt-1">
                Pauses workflow execution for human intervention before continuing.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pause Message</label>
              <Controller
                name="pauseMessage"
                control={control}
                defaultValue="Waiting for human input"
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    placeholder="Message to display when paused"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleFieldChange('pauseMessage', e.target.value);
                    }}
                  />
                )}
              />
              {errors.pauseMessage && (
                <span className="text-red-500 text-xs">{errors.pauseMessage.message as string}</span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Message explaining what input is needed from the human user.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeout (ms)</label>
              <Controller
                name="timeoutMs"
                control={control}
                render={({ field }) => (
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    placeholder="Optional (no timeout if empty)"
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      field.onChange(value || undefined);
                      handleFieldChange('timeoutMs', value || undefined);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              />
              {errors.timeoutMs && (
                <span className="text-red-500 text-xs">{errors.timeoutMs.message as string}</span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Optional timeout after which execution will continue without human input.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Required Fields</label>
              <Controller
                name="requiredFields"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    placeholder="comma,separated,field,names"
                    {...field}
                    onChange={(e) => {
                      // Store as string in the form for editing, convert to array for state
                      const inputValue = e.target.value;
                      field.onChange(inputValue);
                      
                      const fieldArray = inputValue
                        ? inputValue.split(',').map(f => f.trim()).filter(Boolean)
                        : [];
                        
                      handleFieldChange('requiredFields', fieldArray.length > 0 ? fieldArray : undefined);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              />
              {errors.requiredFields && (
                <span className="text-red-500 text-xs">{errors.requiredFields.message as string}</span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Optional list of field names that must be provided before continuing.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Allow State Edits</label>
              <Controller
                name="allowEdits"
                control={control}
                defaultValue={true}
                render={({ field }) => (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowEdits"
                      checked={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.checked);
                        handleFieldChange('allowEdits', e.target.checked);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="allowEdits" className="ml-2 block text-sm text-gray-700">
                      Enable state modification during pauses
                    </label>
                  </div>
                )}
              />
              <p className="text-xs text-gray-500 mt-1 ml-6">
                If enabled, humans can modify the workflow state, not just view it.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={2}
                    placeholder="Optional description"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleFieldChange('description', e.target.value);
                    }}
                  />
                )}
              />
              {errors.description && (
                <span className="text-red-500 text-xs">{errors.description.message as string}</span>
              )}
            </div>
          </>
        );
        
      default:
        // Generic node without specific fields
        return <div className="italic text-gray-500">No additional settings for this node type.</div>;
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
