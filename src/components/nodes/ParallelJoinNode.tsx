import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { IconMerge } from '@/components/ui/icons';

interface ParallelJoinNodeData {
  label: string;
  mergeStrategy: 'concat' | 'merge' | 'custom';
  customMerger?: string;
  waitForAll: boolean;
  description?: string;
}

const ParallelJoinNode = ({ data, selected }: NodeProps<ParallelJoinNodeData>) => {
  const mergeStrategy = data.mergeStrategy || 'merge';
  const waitForAll = data.waitForAll !== false; // Default to true if not specified
  
  // Helper to show a badge with the merge strategy
  const getMergeStrategyBadge = () => {
    switch (mergeStrategy) {
      case 'concat':
        return <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">Concat</span>;
      case 'custom':
        return <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Custom</span>;
      default: // 'merge'
        return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Merge</span>;
    }
  };
  
  return (
    <div className={`rounded-md p-3 border-2 ${selected ? 'border-indigo-600' : 'border-indigo-300'} bg-indigo-50 min-w-[160px]`}>
      {/* Multiple target handles on top for incoming branches */}
      <Handle
        type="target"
        position={Position.Top}
        className={`w-3 h-3 bg-indigo-500 ${selected ? 'ring-2 ring-indigo-300' : ''}`}
        style={{ left: '25%' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        className={`w-3 h-3 bg-indigo-500 ${selected ? 'ring-2 ring-indigo-300' : ''}`}
        style={{ left: '50%' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        className={`w-3 h-3 bg-indigo-500 ${selected ? 'ring-2 ring-indigo-300' : ''}`}
        style={{ left: '75%' }}
      />
      
      <div className="flex items-center gap-2">
        <IconMerge className="h-5 w-5 text-indigo-600" />
        <div className="font-medium text-gray-800">{data.label}</div>
      </div>
      
      {data.description && (
        <div className="mt-1 text-xs text-gray-500">{data.description}</div>
      )}
      
      <div className="mt-2 flex flex-wrap gap-2">
        <div className="text-xs font-medium">
          Strategy: {getMergeStrategyBadge()}
        </div>
        
        <div className="text-xs font-medium">
          {waitForAll ? (
            <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">Wait for All</span>
          ) : (
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Process Each</span>
          )}
        </div>
      </div>
      
      {mergeStrategy === 'custom' && data.customMerger && (
        <div className="mt-2 text-xs bg-white p-2 rounded border border-indigo-200 overflow-hidden text-ellipsis">
          <span className="font-medium">Custom merger:</span> {data.customMerger.length > 30 ? `${data.customMerger.substring(0, 30)}...` : data.customMerger}
        </div>
      )}
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className={`w-3 h-3 bg-indigo-500 ${selected ? 'ring-2 ring-indigo-300' : ''}`}
        id="default"
      />
    </div>
  );
};

export default memo(ParallelJoinNode);
