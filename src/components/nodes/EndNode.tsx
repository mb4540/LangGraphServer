import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface EndNodeData {
  label: string;
  outputFormat?: string;
}

const EndNode = ({ data, selected }: NodeProps<EndNodeData>) => {
  return (
    <div className={`rounded-md p-3 border-2 ${selected ? 'border-red-600' : 'border-red-300'} bg-red-50 min-w-[150px]`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-red-500" />
      
      <div className="font-medium text-gray-800">{data.label}</div>
      
      {data.outputFormat && (
        <div className="mt-1 text-xs text-gray-500">
          Output: {data.outputFormat}
        </div>
      )}
      
      {/* No source handle as this is an end node */}
    </div>
  );
};

export default memo(EndNode);
