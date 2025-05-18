import React from 'react';
import useGraphStore from '@/store/graphStore';

const DetailPanel: React.FC = () => {
  const { selectedNodeId, nodes } = useGraphStore();
  
  const selectedNode = selectedNodeId ? nodes.find(node => node.id === selectedNodeId) : null;
  
  return (
    <div className="h-full p-4 bg-white shadow-inner">
      <h2 className="text-lg font-bold mb-4">Detail Panel</h2>
      
      {selectedNode ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Node ID</label>
            <div className="p-2 bg-gray-50 rounded border border-gray-200">{selectedNode.id}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <div className="p-2 bg-gray-50 rounded border border-gray-200">{selectedNode.type}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
            <input
              type="text"
              value={selectedNode.data.label}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              // In a real implementation, this would update the node
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">X</label>
                <input
                  type="number"
                  value={selectedNode.position.x}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Y</label>
                <input
                  type="number"
                  value={selectedNode.position.y}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[calc(100%-3rem)] text-gray-500">
          Select a node to view details
        </div>
      )}
    </div>
  );
};

export default DetailPanel;
