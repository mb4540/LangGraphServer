import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { IconAlertTriangle } from '@/components/ui/icons';

interface ErrorRetryNodeData {
  label: string;
  maxRetries: number;
  backoffType: 'constant' | 'linear' | 'exponential';
  initialDelayMs: number;
  maxDelayMs: number;
  jitter: boolean;
  description?: string;
}

const ErrorRetryNode = ({ data, selected }: NodeProps<ErrorRetryNodeData>) => {
  // Extract data with defaults
  const maxRetries = data.maxRetries || 3;
  const initialDelayMs = data.initialDelayMs || 1000;
  const maxDelayMs = data.maxDelayMs || 30000;
  const backoffType = data.backoffType || 'exponential';
  const jitter = data.jitter !== false; // Default to true if not specified
  
  return (
    <div className={`rounded-md p-3 border-2 ${selected ? 'border-orange-600' : 'border-orange-300'} bg-orange-50 min-w-[160px]`}>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className={`w-3 h-3 bg-orange-500 ${selected ? 'ring-2 ring-orange-300' : ''}`}
      />
      
      <div className="flex items-center gap-2">
        <IconAlertTriangle className="h-5 w-5 text-orange-600" />
        <div className="font-medium text-gray-800">{data.label}</div>
      </div>
      
      {data.description && (
        <div className="mt-1 text-xs text-gray-500">{data.description}</div>
      )}
      
      <div className="mt-2 flex flex-wrap gap-1">
        <div className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
          Max: {maxRetries}
        </div>
        
        <div className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
          Delay: {initialDelayMs}ms
        </div>
        
        <div className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded capitalize">
          {backoffType}
        </div>
        
        {jitter && (
          <div className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
            Jitter
          </div>
        )}
      </div>
      
      {/* Should retry handle - for retry path */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="should_retry"
        className={`w-3 h-3 bg-orange-500 ${selected ? 'ring-2 ring-orange-300' : ''}`}
        style={{ left: '30%' }}
      />
      
      {/* Continue handle - for normal path after retries */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="continue"
        className={`w-3 h-3 bg-green-500 ${selected ? 'ring-2 ring-green-300' : ''}`}
        style={{ left: '70%' }}
      />
    </div>
  );
};

export default memo(ErrorRetryNode);
