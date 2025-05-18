import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { IconBrackets } from '@/components/ui/icons';

interface SubgraphNodeData {
  label: string;
  graphId: string;
  version?: string;
  inputMapping?: Record<string, string>;
  outputMapping?: Record<string, string>;
  description?: string;
}

const SubgraphNode = ({ data, selected }: NodeProps<SubgraphNodeData>) => {
  // Extract data with defaults
  const graphId = data.graphId || 'Not specified';
  const version = data.version || 'latest';
  const hasInputMapping = data.inputMapping && Object.keys(data.inputMapping).length > 0;
  const hasOutputMapping = data.outputMapping && Object.keys(data.outputMapping).length > 0;
  
  return (
    <div className={`rounded-md p-3 border-2 ${selected ? 'border-indigo-600' : 'border-indigo-300'} bg-indigo-50 min-w-[180px]`}>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className={`w-3 h-3 bg-indigo-500 ${selected ? 'ring-2 ring-indigo-300' : ''}`}
      />
      
      <div className="flex items-center gap-2">
        <IconBrackets className="h-5 w-5 text-indigo-600" />
        <div className="font-medium text-gray-800">{data.label}</div>
      </div>
      
      <div className="mt-2 text-xs text-gray-600 bg-indigo-100 p-1.5 rounded-md">
        Graph: {graphId.length > 30 ? `${graphId.substring(0, 27)}...` : graphId}
      </div>
      
      {data.description && (
        <div className="mt-1 text-xs text-gray-500">{data.description}</div>
      )}
      
      <div className="mt-2 flex flex-wrap gap-1">
        <div className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
          v: {version}
        </div>
        
        {hasInputMapping && (
          <div className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
            Inputs: {Object.keys(data.inputMapping).length}
          </div>
        )}
        
        {hasOutputMapping && (
          <div className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
            Outputs: {Object.keys(data.outputMapping).length}
          </div>
        )}
      </div>
      
      {/* Success output */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="success"
        className={`w-3 h-3 bg-green-500 ${selected ? 'ring-2 ring-green-300' : ''}`}
        style={{ left: '40%' }}
      />
      
      {/* Error output */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="error"
        className={`w-3 h-3 bg-red-500 ${selected ? 'ring-2 ring-red-300' : ''}`}
        style={{ left: '60%' }}
      />
    </div>
  );
};

export default memo(SubgraphNode);
