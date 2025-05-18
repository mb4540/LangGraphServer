import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface EndNodeData {
  label: string;
  outputFormat?: 'json' | 'text' | 'markdown';
  finalTransform?: string;
  description?: string;
}

const EndNode = ({ data, selected }: NodeProps<EndNodeData>) => {
  return (
    <div className={`rounded-md p-3 border-2 ${selected ? 'border-red-600' : 'border-red-300'} bg-red-50 min-w-[150px]`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-red-500" />
      
      <div className="font-medium text-gray-800 flex items-center">
        <span className="mr-2 bg-red-500 text-white px-2 py-0.5 text-xs rounded-full">END</span>
        {data.label}
      </div>
      
      <div className="mt-2 text-xs space-y-1">
        {data.outputFormat && (
          <div className="text-gray-600 flex items-center">
            <span className="font-semibold mr-1">Format:</span>
            <span className="bg-red-100 px-1.5 py-0.5 rounded">
              {data.outputFormat}
            </span>
          </div>
        )}
        
        {data.finalTransform && (
          <div className="text-gray-600">
            <div className="font-semibold">Transform:</div>
            <div className="font-mono bg-red-100 p-1 mt-1 rounded text-red-800 text-xs overflow-x-auto max-h-20 overflow-y-auto">
              {data.finalTransform.length > 60 
                ? `${data.finalTransform.slice(0, 60)}...` 
                : data.finalTransform}
            </div>
          </div>
        )}
        
        {data.description && data.description !== 'Terminal node that marks completion' && (
          <div className="text-gray-500 italic text-xs mt-1">
            {data.description}
          </div>
        )}
      </div>
      
      {/* Terminal sink nodes have no outgoing connections */}
      {/* No source handle as END is a terminal node */}
    </div>
  );
};

export default memo(EndNode);
