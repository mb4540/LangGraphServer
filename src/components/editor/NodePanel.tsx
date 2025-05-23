import React from 'react';

interface NodePanelProps {
  onAddNode: (type: string, label: string) => void;
}

const nodeTypes = [
  { type: 'llm', label: 'LLM', description: 'Language Model Node' },
  { type: 'tool', label: 'Tool', description: 'Function or Tool Call' },
  { type: 'condition', label: 'Condition', description: 'Conditional Logic' },
  { type: 'input', label: 'Input', description: 'Graph Input' },
  { type: 'output', label: 'Output', description: 'Graph Output' },
  { type: 'subgraph', label: 'Subgraph', description: 'Nested Graph Component' },
];

export default function NodePanel({ onAddNode }: NodePanelProps) {
  return (
    <div className="w-64 border-r bg-gray-50 flex flex-col h-full">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold">Node Types</h3>
      </div>
      <div className="p-4 overflow-y-auto flex-grow custom-scrollbar">
        <div className="space-y-2">
          {nodeTypes.map((nodeType) => (
            <div
              key={nodeType.type}
              className="p-3 bg-white rounded-md shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onAddNode(nodeType.type, nodeType.label)}
            >
              <div className="font-medium">{nodeType.label}</div>
              <div className="text-xs text-gray-500">{nodeType.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
