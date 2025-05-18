import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface LLMNodeData {
  label: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

const LLMNode = ({ data, selected }: NodeProps<LLMNodeData>) => {
  return (
    <div className={`rounded-md p-3 border-2 ${selected ? 'border-blue-600' : 'border-blue-300'} bg-blue-50 min-w-[150px]`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      
      <div className="font-medium text-gray-800">{data.label}</div>
      
      {data.model && (
        <div className="mt-1 text-xs text-gray-500">
          Model: {data.model}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  );
};

export default memo(LLMNode);
