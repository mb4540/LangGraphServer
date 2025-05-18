import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface MemoryReadNodeData {
  label: string;
  memoryType: 'short_term' | 'long_term';
  key?: string;
  ttl?: number;
  namespace?: string;
  filter?: string;
}

const MemoryReadNode = ({ data, selected }: NodeProps<MemoryReadNodeData>) => {
  // Determine color based on memory type
  const getMemoryTypeColor = () => {
    switch (data.memoryType) {
      case 'long_term':
        return { border: 'border-purple-300', bg: 'bg-purple-50', handle: 'bg-purple-500', badge: 'bg-purple-500' };
      case 'short_term':
      default:
        return { border: 'border-cyan-300', bg: 'bg-cyan-50', handle: 'bg-cyan-500', badge: 'bg-cyan-500' };
    }
  };
  
  const colors = getMemoryTypeColor();
  
  return (
    <div className={`rounded-md p-3 border-2 ${selected ? 'border-cyan-600' : colors.border} ${colors.bg} min-w-[180px]`}>
      <Handle type="target" position={Position.Top} className={`w-3 h-3 ${colors.handle}`} />
      
      <div className="font-medium text-gray-800 flex items-center mb-2">
        <span className={`mr-2 ${colors.badge} text-white px-2 py-0.5 text-xs rounded-full`}>READ</span>
        {data.label}
      </div>
      
      <div className="mt-1 text-xs space-y-1">
        <div className="text-gray-600 flex items-center">
          <span className="font-semibold mr-1">Type:</span>
          <span className={`${colors.badge} text-white px-1.5 py-0.5 rounded text-xs`}>
            {data.memoryType === 'long_term' ? 'LONG-TERM' : 'SHORT-TERM'}
          </span>
        </div>
        
        {data.key && (
          <div className="text-gray-600 flex items-center">
            <span className="font-semibold mr-1">Key:</span>
            <span className="font-mono bg-white/50 p-1 rounded border border-gray-200 text-xs">
              {data.key}
            </span>
          </div>
        )}
        
        {data.namespace && (
          <div className="text-gray-600 flex items-center">
            <span className="font-semibold mr-1">Namespace:</span>
            <span>{data.namespace}</span>
          </div>
        )}
        
        {data.filter && (
          <div className="text-gray-600 flex items-center">
            <span className="font-semibold mr-1">Filter:</span>
            <span className="italic">Custom filter</span>
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className={`w-3 h-3 ${colors.handle}`} />
    </div>
  );
};

export default memo(MemoryReadNode);
