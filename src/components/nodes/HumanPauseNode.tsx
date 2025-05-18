import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { IconUser } from '@/components/ui/icons';

interface HumanPauseNodeData {
  label: string;
  pauseMessage: string;
  timeoutMs?: number;
  requiredFields?: string[];
  allowEdits: boolean;
  description?: string;
}

const HumanPauseNode = ({ data, selected }: NodeProps<HumanPauseNodeData>) => {
  // Extract data with defaults
  const pauseMessage = data.pauseMessage || 'Waiting for human input';
  const timeoutMs = data.timeoutMs;
  const allowEdits = data.allowEdits !== undefined ? data.allowEdits : true;
  
  return (
    <div className={`rounded-md p-3 border-2 ${selected ? 'border-blue-600' : 'border-blue-300'} bg-blue-50 min-w-[160px]`}>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className={`w-3 h-3 bg-blue-500 ${selected ? 'ring-2 ring-blue-300' : ''}`}
      />
      
      <div className="flex items-center gap-2">
        <IconUser className="h-5 w-5 text-blue-600" />
        <div className="font-medium text-gray-800">{data.label}</div>
      </div>
      
      {data.description && (
        <div className="mt-1 text-xs text-gray-500">{data.description}</div>
      )}
      
      <div className="mt-2 text-xs text-gray-600 bg-blue-100 p-1.5 rounded-md">
        {pauseMessage.length > 40 ? `${pauseMessage.substring(0, 40)}...` : pauseMessage}
      </div>
      
      <div className="mt-2 flex flex-wrap gap-1">
        {timeoutMs && (
          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
            Timeout: {(timeoutMs / 1000).toFixed(1)}s
          </div>
        )}
        
        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
          {allowEdits ? 'Editable' : 'View Only'}
        </div>
        
        {data.requiredFields && data.requiredFields.length > 0 && (
          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
            Required Fields: {data.requiredFields.length}
          </div>
        )}
      </div>
      
      {/* Continue output - execution proceeds after human input */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="continue"
        className={`w-3 h-3 bg-green-500 ${selected ? 'ring-2 ring-green-300' : ''}`}
        style={{ left: '40%' }}
      />
      
      {/* Skip output - execution skips human input (timeout or explicit) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="skip"
        className={`w-3 h-3 bg-yellow-500 ${selected ? 'ring-2 ring-yellow-300' : ''}`}
        style={{ left: '60%' }}
      />
    </div>
  );
};

export default memo(HumanPauseNode);
