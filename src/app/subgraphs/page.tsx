"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SubgraphNodeData } from '@/utils/schemaUtils';

interface SubgraphItem {
  graph_id: string;
  name?: string;
  versions: string[];
  metadata?: Record<string, any>;
}

export default function SubgraphsPage() {
  const [subgraphs, setSubgraphs] = useState<SubgraphItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGraph, setSelectedGraph] = useState<SubgraphItem | null>(null);

  // Fetch available subgraphs
  useEffect(() => {
    const fetchSubgraphs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/graphs');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch subgraphs: ${response.statusText}`);
        }
        
        const data = await response.json();
        setSubgraphs(data);
      } catch (err) {
        console.error("Error fetching subgraphs:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        
        // Provide sample data for demonstration
        setSubgraphs([
          {
            graph_id: "sentiment-analysis",
            name: "Sentiment Analysis",
            versions: ["latest", "1.0.0"],
            metadata: { description: "Analyzes text for sentiment" }
          },
          {
            graph_id: "data-extraction",
            name: "Data Extraction",
            versions: ["latest", "2.1.0", "2.0.0"],
            metadata: { description: "Extracts structured data from text" }
          },
          {
            graph_id: "summarization",
            name: "Text Summarization",
            versions: ["latest", "0.9.0"],
            metadata: { description: "Creates concise summaries from long text" }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubgraphs();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subgraphs Library</h1>
        <Link 
          href="/editor" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Create New Graph
        </Link>
      </div>
      
      {loading && (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading subgraphs...</p>
        </div>
      )}
      
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">Error loading subgraphs</p>
          <p className="text-sm">{error}</p>
          <p className="text-sm mt-2">Displaying sample data for demonstration purposes.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subgraphs.map((graph) => (
          <div 
            key={graph.graph_id}
            className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-lg transition cursor-pointer"
            onClick={() => setSelectedGraph(graph)}
          >
            <h2 className="text-xl font-semibold text-gray-800">{graph.name || graph.graph_id}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {graph.versions.map(version => (
                <span key={version} className="px-2 py-1 bg-gray-100 text-xs rounded">
                  {version}
                </span>
              ))}
            </div>
            <p className="mt-3 text-gray-600 text-sm">
              {graph.metadata?.description || "No description available"}
            </p>
            <div className="mt-4 flex justify-between items-center">
              <button 
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`/api/graphs/${graph.graph_id}/schema`, '_blank');
                }}
              >
                View Schema
              </button>
              <button 
                className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded hover:bg-indigo-200 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  // This would redirect to an example that uses this subgraph
                  window.location.href = `/examples?graph=${graph.graph_id}`;
                }}
              >
                See Examples
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Display when no subgraphs are available */}
      {!loading && subgraphs.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700">No Subgraphs Available</h3>
          <p className="mt-2 text-gray-500">
            Create and publish graphs to make them available as reusable subgraphs.
          </p>
          <Link 
            href="/editor"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Create Your First Graph
          </Link>
        </div>
      )}
      
      {/* Modal for selecting a graph */}
      {selectedGraph && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              Use {selectedGraph.name || selectedGraph.graph_id} as Subgraph
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Version
              </label>
              <select 
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                defaultValue={selectedGraph.versions[0]}
              >
                {selectedGraph.versions.map(version => (
                  <option key={version} value={version}>{version}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Configuration
              </label>
              <div className="bg-gray-50 rounded-md p-4 text-sm">
                <div className="mb-2">
                  <strong>Graph ID:</strong> {selectedGraph.graph_id}
                </div>
                {selectedGraph.metadata?.description && (
                  <div className="mb-2">
                    <strong>Description:</strong> {selectedGraph.metadata.description}
                  </div>
                )}
                <div>
                  <strong>Input Mapping:</strong> Will be configured in the node editor
                </div>
                <div>
                  <strong>Output Mapping:</strong> Will be configured in the node editor
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setSelectedGraph(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                onClick={() => {
                  // This would normally add the subgraph to the current graph
                  alert(`Subgraph ${selectedGraph.graph_id} would be added to your workflow`);
                  setSelectedGraph(null);
                }}
              >
                Add to Workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
