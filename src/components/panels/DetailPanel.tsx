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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Module Path</label>
              <Controller
                name="modulePath"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('argsSchema', e.target.value);
                    }}
                  />
                )}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeout (ms)</label>
              <Controller
                name="timeout"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
              <Controller
                name="outputFormat"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Final Transform</label>
              <Controller
                name="finalTransform"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldBlur('finalTransform', e.target.value);
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
