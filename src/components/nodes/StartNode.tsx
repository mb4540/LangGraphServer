import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface StartNodeData {
  label: string;
  initialState?: Record<string, any>;
}

const StartNode = ({ data, selected }: NodeProps<StartNodeData>) => {
  return (
    <div className={`rounded-md p-3 border-2 ${selected ? 'border-emerald-600' : 'border-emerald-300'} bg-emerald-50 min-w-[150px]`}>
      {/* START nodes don't have an input handle - they're only the beginning of a graph */}
      
      <div className="font-medium text-gray-800 flex items-center">
        <span className="mr-2 bg-emerald-500 text-white px-2 py-0.5 text-xs rounded-full">START</span>
        {data.label}
      </div>
      
      {data.initialState && (
        <div className="mt-1 text-xs text-gray-500">
          <div className="font-semibold">Initial State:</div>
          <div className="font-mono bg-emerald-100 p-1 mt-1 rounded text-emerald-800 text-xs overflow-x-auto">
            {JSON.stringify(data.initialState, null, 2).slice(0, 50)}
            {JSON.stringify(data.initialState, null, 2).length > 50 ? '...' : ''}
          </div>
        </div>
      )}
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-emerald-500" 
        id="output"
      />
    </div>
  );
};

export default memo(StartNode);
