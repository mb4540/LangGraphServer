"use client";

import { useState } from 'react';
import GraphEditor from '@/components/editor/GraphEditor';

export default function NewGraphPage() {
  const [graphName, setGraphName] = useState('');
  
  return (
    <div className="flex flex-col h-screen p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Create New Graph</h1>
          <input
            type="text"
            placeholder="Graph Name"
            value={graphName}
            onChange={(e) => setGraphName(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="space-x-2">
          <button 
            className="px-4 py-2 text-white bg-primary rounded-md hover:bg-blue-600 transition-colors"
          >
            Save Graph
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden bg-white border rounded-lg shadow-sm">
        <GraphEditor />
      </div>
    </div>
  );
}
