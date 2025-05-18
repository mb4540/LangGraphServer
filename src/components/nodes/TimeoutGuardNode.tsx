import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { IconClock } from '@/components/ui/icons';

interface TimeoutGuardNodeData {
  label: string;
  timeoutMs: number;
  onTimeout: 'error' | 'default' | 'abort';
  defaultResult?: string;
  heartbeatIntervalMs?: number;
  description?: string;
}

const TimeoutGuardNode = ({ data, selected }: NodeProps<TimeoutGuardNodeData>) => {
  // Extract data with defaults
  const timeoutMs = data.timeoutMs || 60000; // 60 seconds default
  const onTimeout = data.onTimeout || 'error';
  const heartbeatIntervalMs = data.heartbeatIntervalMs;
  
  return (
    <div className={`rounded-md p-3 border-2 ${selected ? 'border-purple-600' : 'border-purple-300'} bg-purple-50 min-w-[160px]`}>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className={`w-3 h-3 bg-purple-500 ${selected ? 'ring-2 ring-purple-300' : ''}`}
      />
      
      <div className="flex items-center gap-2">
        <IconClock className="h-5 w-5 text-purple-600" />
        <div className="font-medium text-gray-800">{data.label}</div>
      </div>
      
      {data.description && (
        <div className="mt-1 text-xs text-gray-500">{data.description}</div>
      )}
      
      <div className="mt-2 flex flex-wrap gap-1">
        <div className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
          {(timeoutMs / 1000).toFixed(1)}s
        </div>
        
        <div className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded capitalize">
          {onTimeout}
        </div>
        
        {heartbeatIntervalMs && (
          <div className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
            Heartbeat: {(heartbeatIntervalMs / 1000).toFixed(1)}s
          </div>
        )}
      </div>
      
      {/* Normal output - execution completed before timeout */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="normal"
        className={`w-3 h-3 bg-green-500 ${selected ? 'ring-2 ring-green-300' : ''}`}
        style={{ left: '30%' }}
      />
      
      {/* Timeout output - execution hit timeout */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="expired"
        className={`w-3 h-3 bg-red-500 ${selected ? 'ring-2 ring-red-300' : ''}`}
        style={{ left: '70%' }}
      />
    </div>
  );
};

export default memo(TimeoutGuardNode);
