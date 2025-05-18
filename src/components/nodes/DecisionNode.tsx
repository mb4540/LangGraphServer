import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { IconBranch, IconSwitch } from '@/components/ui/icons';

interface Predicate {
  name: string;
  expression: string;
  description?: string;
}

interface DecisionNodeData {
  label: string;
  condition?: string;
  branches?: string[];
  predicates?: Predicate[];
  evaluationMode?: 'simple' | 'advanced';
  defaultBranch?: string;
}

const DecisionNode = ({ data, selected }: NodeProps<DecisionNodeData>) => {
  const isAdvancedMode = data.evaluationMode === 'advanced';
  const predicates = data.predicates || [];
  const branches = data.branches || [];
  
  const positionAngle = (index: number, total: number) => {
    // Calculate positions evenly distributed around the right side of the node
    const angleRange = 180; // degrees (half circle on right side)
    const angle = (-90 + angleRange / (total + 1) * (index + 1)) * Math.PI / 180;
    return {
      x: 50 + 50 * Math.cos(angle),
      y: 50 + 50 * Math.sin(angle),
    };
  };
  
  const renderDynamicHandles = () => {
    if (isAdvancedMode && predicates.length > 0) {
      return predicates.map((predicate, index) => {
        const position = positionAngle(index, predicates.length);
        return (
          <Handle
            key={predicate.name}
            type="source"
            position={Position.Right}
            className={`w-3 h-3 bg-yellow-500 ${selected ? 'ring-2 ring-yellow-300' : ''}`}
            id={predicate.name}
            style={{ top: `${position.y}%`, right: 0 }}
          />
        );
      });
    } else if (!isAdvancedMode && branches.length > 0) {
      // For simple mode with fixed branches
      return branches.map((branch, index) => {
        // For the first two branches, use Left and Right positions
        if (index === 0) {
          return (
            <Handle
              key={branch}
              type="source"
              position={Position.Right}
              className={`w-3 h-3 bg-yellow-500 ${selected ? 'ring-2 ring-yellow-300' : ''}`}
              id={branch}
            />
          );
        } else if (index === 1) {
          return (
            <Handle
              key={branch}
              type="source"
              position={Position.Left}
              className={`w-3 h-3 bg-yellow-500 ${selected ? 'ring-2 ring-yellow-300' : ''}`}
              id={branch}
            />
          );
        } else {
          // For additional branches, distribute around the node
          const position = positionAngle(index - 2, branches.length - 2);
          return (
            <Handle
              key={branch}
              type="source"
              position={Position.Right}
              className={`w-3 h-3 bg-yellow-500 ${selected ? 'ring-2 ring-yellow-300' : ''}`}
              id={branch}
              style={{ top: `${position.y}%`, right: 0 }}
            />
          );
        }
      });
    }
  };
  
  return (
    <div className={`rounded-md p-3 border-2 ${selected ? 'border-yellow-600' : 'border-yellow-300'} bg-yellow-50 min-w-[180px]`}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className={`w-3 h-3 bg-yellow-500 ${selected ? 'ring-2 ring-yellow-300' : ''}`} 
      />
      
      <div className="flex items-center gap-2 font-medium text-gray-800">
        {isAdvancedMode ? 
          <IconSwitch className="h-4 w-4 text-yellow-600" /> : 
          <IconBranch className="h-4 w-4 text-yellow-600" />
        }
        <span>{data.label}</span>
        <span className="ml-auto text-xs px-1.5 py-0.5 bg-yellow-200 text-yellow-800 rounded">
          {isAdvancedMode ? 'Advanced' : 'Simple'}
        </span>
      </div>
      
      {!isAdvancedMode && data.condition && (
        <div className="mt-2 text-xs text-gray-600 bg-white p-1.5 rounded border border-gray-200 overflow-hidden text-ellipsis">
          <span className="font-medium">Condition:</span> {data.condition.length > 50 ? `${data.condition.substring(0, 50)}...` : data.condition}
        </div>
      )}

      {isAdvancedMode && predicates && predicates.length > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          <div className="font-medium mb-1">Predicates:</div>
          <div className="space-y-1">
            {predicates.map((predicate) => (
              <div key={predicate.name} className="flex items-center bg-white p-1 rounded border border-gray-200">
                <span className="font-medium text-yellow-700">{predicate.name}</span>
                {predicate.description && (
                  <span className="ml-1 text-gray-500 truncate" title={predicate.description}>
                    - {predicate.description.length > 15 ? `${predicate.description.substring(0, 15)}...` : predicate.description}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!isAdvancedMode && data.branches && data.branches.length > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          <span className="font-medium">Branches:</span> {data.branches.join(', ')}
        </div>
      )}
      
      {/* Default handle at the bottom */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={`w-3 h-3 ${data.defaultBranch ? 'bg-yellow-500' : 'bg-gray-300'} ${selected ? 'ring-2 ring-yellow-300' : ''}`} 
        id="default"
      />
      
      {data.defaultBranch && (
        <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-gray-500 -mb-5">
          default
        </div>
      )}
      
      {/* Dynamic handles based on predicates or branches */}
      {renderDynamicHandles()}
    </div>
  );
};

export default memo(DecisionNode);

// Add these icons to a new file `/src/components/ui/icons.tsx`
// or modify the import at the top if you already have icons defined elsewhere
