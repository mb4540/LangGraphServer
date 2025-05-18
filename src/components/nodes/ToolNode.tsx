import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface ToolNodeData {
  label: string;
  toolName?: string;
  parameters?: Record<string, any>;
}

const ToolNode = ({ data, selected }: NodeProps<ToolNodeData>) => {
  return (
    <div className={`rounded-md p-3 border-2 ${selected ? 'border-green-600' : 'border-green-300'} bg-green-50 min-w-[150px]`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-green-500" />
      
      <div className="font-medium text-gray-800">{data.label}</div>
      
      {data.toolName && (
        <div className="mt-1 text-xs text-gray-500">
          Tool: {data.toolName}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500" />
    </div>
  );
};

export default memo(ToolNode);
