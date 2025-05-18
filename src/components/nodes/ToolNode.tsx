import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface ToolNodeData {
  label: string;
  modulePath?: string;
  functionName?: string;
  argsSchema?: string;
  timeout?: number;
  concurrency?: number;
  errorHandling?: 'fail' | 'ignore' | 'retry';
  maxRetries?: number;
}

const ToolNode = ({ data, selected }: NodeProps<ToolNodeData>) => {
  // Determine error handling badge color
  const getErrorBadgeColor = () => {
    switch (data.errorHandling) {
      case 'retry':
        return 'bg-yellow-500';
      case 'ignore':
        return 'bg-blue-500';
      case 'fail':
      default:
        return 'bg-red-500';
    }
  };
  
  return (
    <div className={`rounded-md p-3 border-2 ${selected ? 'border-green-600' : 'border-green-300'} bg-green-50 min-w-[180px]`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-green-500" />
      
      <div className="font-medium text-gray-800 flex items-center mb-2">
        <span className="mr-2 bg-green-500 text-white px-2 py-0.5 text-xs rounded-full">TOOL</span>
        {data.label}
      </div>
      
      <div className="mt-1 text-xs space-y-1">
        {data.modulePath && data.functionName && (
          <div className="text-gray-600">
            <div className="font-mono bg-white/50 p-1 rounded border border-gray-200 text-xs overflow-x-auto">
              {data.modulePath}.{data.functionName}()
            </div>
          </div>
        )}
        
        {(data.concurrency && data.concurrency > 1) && (
          <div className="text-gray-600 flex items-center">
            <span className="font-semibold mr-1">Concurrency:</span>
            <span className="bg-teal-100 px-1.5 py-0.5 rounded text-teal-700">
              {data.concurrency}
            </span>
          </div>
        )}
        
        {data.timeout && (
          <div className="text-gray-600 flex items-center">
            <span className="font-semibold mr-1">Timeout:</span>
            <span>{data.timeout}ms</span>
          </div>
        )}
        
        {data.errorHandling && (
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-600">Error:</span>
            <span className={`${getErrorBadgeColor()} text-white px-1.5 py-0.5 text-xs rounded`}>
              {data.errorHandling.toUpperCase()}
              {data.errorHandling === 'retry' && data.maxRetries !== undefined && ` (${data.maxRetries})`}
            </span>
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500" />
    </div>
  );
};

export default memo(ToolNode);
