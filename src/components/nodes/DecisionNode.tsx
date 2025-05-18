import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface DecisionNodeData {
  label: string;
  condition?: string;
  branches?: string[];
}

const DecisionNode = ({ data, selected }: NodeProps<DecisionNodeData>) => {
  return (
    <div className={`rounded-md p-3 border-2 ${selected ? 'border-yellow-600' : 'border-yellow-300'} bg-yellow-50 min-w-[150px]`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-yellow-500" />
      
      <div className="font-medium text-gray-800">{data.label}</div>
      
      {data.condition && (
        <div className="mt-1 text-xs text-gray-500">
          Condition: {data.condition}
        </div>
      )}

      {data.branches && data.branches.length > 0 && (
        <div className="mt-1 text-xs text-gray-500">
          Branches: {data.branches.join(', ')}
        </div>
      )}
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-yellow-500" 
        id="default"
      />
      
      {/* Additional handles for multiple branches can be added here */}
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-yellow-500" 
        id="true"
      />
      
      <Handle 
        type="source" 
        position={Position.Left} 
        className="w-3 h-3 bg-yellow-500" 
        id="false"
      />
    </div>
  );
};

export default memo(DecisionNode);
