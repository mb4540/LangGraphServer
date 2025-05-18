import React from 'react';
import useGraphStore from '@/store/graphStore';

const GraphCanvas: React.FC = () => {
  const { graphName } = useGraphStore();
  
  return (
    <div className="h-full p-4 bg-gray-100 flex flex-col">
      <h2 className="text-lg font-bold mb-4">Graph Canvas: {graphName}</h2>
      <div className="flex-1 bg-white rounded-md border border-gray-200 shadow-inner">
        {/* ReactFlow or another graph visualization would go here */}
        <div className="flex items-center justify-center h-full text-gray-500">
          Graph visualization will be rendered here
        </div>
      </div>
    </div>
  );
};

export default GraphCanvas;
