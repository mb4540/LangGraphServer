import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { IconSplit } from '@/components/ui/icons';

interface ParallelForkNodeData {
  label: string;
  minBranches: number;
  description?: string;
}

const ParallelForkNode = ({ data, selected }: NodeProps<ParallelForkNodeData>) => {
  const minBranches = data.minBranches || 2;
  
  // Generate dynamic handles based on minBranches
  const renderBranchHandles = () => {
    const handles = [];
    
    // Calculate positions for handles based on the number of branches
    for (let i = 0; i < minBranches; i++) {
      // Distribute handles evenly across the bottom of the node
      const position = {
        left: `${(100 / (minBranches + 1)) * (i + 1)}%`,
      };
      
      handles.push(
        <Handle
          key={`branch-${i}`}
          type="source"
          position={Position.Bottom}
          id={`branch-${i}`}
          className={`w-3 h-3 bg-blue-500 ${selected ? 'ring-2 ring-blue-300' : ''}`}
          style={{ left: position.left, bottom: 0 }}
        />
      );
    }
    
    return handles;
  };
  
  return (
    <div className={`rounded-md p-3 border-2 ${selected ? 'border-blue-600' : 'border-blue-300'} bg-blue-50 min-w-[160px]`}>
      <Handle
        type="target"
        position={Position.Top}
        className={`w-3 h-3 bg-blue-500 ${selected ? 'ring-2 ring-blue-300' : ''}`}
      />
      
      <div className="flex items-center gap-2">
        <IconSplit className="h-5 w-5 text-blue-600" />
        <div className="font-medium text-gray-800">{data.label}</div>
      </div>
      
      {data.description && (
        <div className="mt-1 text-xs text-gray-500">{data.description}</div>
      )}
      
      <div className="mt-2 text-xs font-medium text-blue-800 bg-blue-100 px-2 py-1 rounded inline-block">
        {minBranches} Parallel Branches
      </div>
      
      {/* Dynamic branch handles */}
      {renderBranchHandles()}
    </div>
  );
};

export default memo(ParallelForkNode);
