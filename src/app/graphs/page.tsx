"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Graph {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function GraphsPage() {
  const [graphs, setGraphs] = useState<Graph[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // This would typically fetch from an API
  useEffect(() => {
    // Mock data for now - in a real app, this would be an API call
    const mockGraphs: Graph[] = [
      {
        id: '1',
        name: 'Customer Support Bot',
        createdAt: '2025-05-15T10:30:00Z',
        updatedAt: '2025-05-17T15:45:00Z',
      },
      {
        id: '2',
        name: 'Content Generator',
        createdAt: '2025-05-10T08:20:00Z',
        updatedAt: '2025-05-10T08:20:00Z',
      },
    ];
    
    // Simulate API call
    setTimeout(() => {
      setGraphs(mockGraphs);
      setIsLoading(false);
    }, 500);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Graphs</h1>
        <Link href="/editor/new" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors">
          Create New Graph
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      ) : graphs.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Graph Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {graphs.map((graph) => (
                <tr key={graph.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{graph.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(graph.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(graph.updatedAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/editor/${graph.id}`} className="text-primary hover:text-blue-600 mr-4">Edit</Link>
                    <button className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Graphs Yet</h3>
          <p className="text-gray-500 mb-4">Create your first LangGraph workflow to get started.</p>
          <Link href="/editor/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Create New Graph
          </Link>
        </div>
      )}
    </div>
  );
}
