import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface AgentNodeData {
  label: string;
  agentType?: 'llm' | 'react' | 'planAndExecute';
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  tools?: string[];
  stopCondition?: string;
  outputParser?: string;
}

const AgentNode = ({ data, selected }: NodeProps<AgentNodeData>) => {
  // Determine color based on agent type
  const getAgentTypeColor = () => {
    switch (data.agentType) {
      case 'react':
        return {
          border: selected ? 'border-purple-600' : 'border-purple-300',
          bg: 'bg-purple-50',
          handle: 'bg-purple-500',
          badge: 'bg-purple-500'
        };
      case 'planAndExecute':
        return {
          border: selected ? 'border-indigo-600' : 'border-indigo-300',
          bg: 'bg-indigo-50',
          handle: 'bg-indigo-500',
          badge: 'bg-indigo-500'
        };
      case 'llm':
      default:
        return {
          border: selected ? 'border-blue-600' : 'border-blue-300', 
          bg: 'bg-blue-50',
          handle: 'bg-blue-500',
          badge: 'bg-blue-500'
        };
    }
  };
  
  const colors = getAgentTypeColor();
  
  return (
    <div className={`rounded-md p-3 border-2 ${colors.border} ${colors.bg} min-w-[180px]`}>
      <Handle type="target" position={Position.Top} className={`w-3 h-3 ${colors.handle}`} />
      
      <div className="font-medium text-gray-800 flex items-center mb-2">
        <span className={`mr-2 ${colors.badge} text-white px-2 py-0.5 text-xs rounded-full`}>
          {data.agentType?.toUpperCase() || 'LLM'}
        </span>
        {data.label}
      </div>
      
      <div className="mt-1 text-xs space-y-1">
        {data.modelName && (
          <div className="text-gray-600 flex items-center">
            <span className="font-semibold mr-1">Model:</span>
            <span>{data.modelName}</span>
          </div>
        )}
        
        {data.temperature !== undefined && (
          <div className="text-gray-600 flex items-center">
            <span className="font-semibold mr-1">Temp:</span>
            <span>{data.temperature}</span>
          </div>
        )}
        
        {data.tools && data.tools.length > 0 && (
          <div className="text-gray-600">
            <span className="font-semibold mr-1">Tools:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.tools.slice(0, 3).map((tool, index) => (
                <span key={index} className={`${colors.bg} border border-gray-300 px-1 rounded text-xs`}>
                  {tool}
                </span>
              ))}
              {data.tools.length > 3 && (
                <span className="text-gray-500 text-xs">+{data.tools.length - 3} more</span>
              )}
            </div>
          </div>
        )}
        
        {data.systemPrompt && (
          <div className="text-gray-600">
            <span className="font-semibold">Prompt:</span>
            <div className="font-mono bg-white/50 p-1 mt-1 rounded border border-gray-200 text-xs overflow-x-auto max-h-16 overflow-y-auto">
              {data.systemPrompt.length > 60 
                ? `${data.systemPrompt.slice(0, 60)}...` 
                : data.systemPrompt}
            </div>
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className={`w-3 h-3 ${colors.handle}`} />
    </div>
  );
};

export default memo(AgentNode);
