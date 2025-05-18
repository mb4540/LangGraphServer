import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const NodeCard = ({ data }: NodeProps) => {
  // Determine node color based on type
  const getBgColor = () => {
    switch (data.nodeType) {
      case 'llm':
        return 'bg-blue-100 border-blue-300';
      case 'tool':
        return 'bg-green-100 border-green-300';
      case 'condition':
        return 'bg-yellow-100 border-yellow-300';
      case 'input':
        return 'bg-purple-100 border-purple-300';
      case 'output':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className={`rounded-md p-3 shadow-md border-2 ${getBgColor()} min-w-[150px]`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500"
      />
      <div className="font-medium">{data.label}</div>
      <div className="text-xs mt-1 text-gray-500">{data.nodeType}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500"
      />
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(NodeCard);
