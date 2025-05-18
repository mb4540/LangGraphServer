import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { IconRefresh } from '@/components/ui/icons';

interface LoopNodeData {
  label: string;
  condition: string;
  maxIterations?: number;
  description?: string;
}

const LoopNode = ({ data, selected }: NodeProps<LoopNodeData>) => {
  // Extract data with defaults
  const condition = data.condition || '';
  const maxIterations = data.maxIterations || 10;
  
  return (
    <div className={`rounded-md p-3 border-2 ${selected ? 'border-amber-600' : 'border-amber-300'} bg-amber-50 min-w-[160px]`}>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className={`w-3 h-3 bg-amber-500 ${selected ? 'ring-2 ring-amber-300' : ''}`}
      />
      
      <div className="flex items-center gap-2">
        <IconRefresh className="h-5 w-5 text-amber-600" />
        <div className="font-medium text-gray-800">{data.label}</div>
      </div>
      
      {data.description && (
        <div className="mt-1 text-xs text-gray-500">{data.description}</div>
      )}
      
      <div className="mt-2 flex flex-wrap gap-1">
        <div className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
          {maxIterations ? `Max: ${maxIterations}` : 'No Max'}
        </div>
        
        {condition && (
          <div className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded" title={condition}>
            {condition.length > 15 ? `Condition: ${condition.substring(0, 15)}...` : `Condition: ${condition}`}
          </div>
        )}
      </div>
      
      {/* Continue loop handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="loop.continue"
        className={`w-3 h-3 bg-green-500 ${selected ? 'ring-2 ring-green-300' : ''}`}
        style={{ left: '30%' }}
      />
      
      {/* Exit loop handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="loop.exit"
        className={`w-3 h-3 bg-red-500 ${selected ? 'ring-2 ring-red-300' : ''}`}
        style={{ left: '70%' }}
      />
    </div>
  );
};

export default memo(LoopNode);
