"use client";

import { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import NodeCard from './NodeCard';
import NodePanel from './NodePanel';

// Define custom node types
const nodeTypes: NodeTypes = {
  nodeCard: NodeCard,
};

// Initial nodes and edges
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export default function GraphEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Handle connection between nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({
        ...connection,
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 }
      }, eds));
    },
    [setEdges]
  );

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Add a new node to the graph
  const addNode = useCallback((type: string, label: string) => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: 'nodeCard',
      position: {
        x: 250,
        y: 100 + nodes.length * 100,
      },
      data: {
        label,
        nodeType: type,
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
  }, [nodes.length, setNodes]);

  return (
    <div className="h-full flex">
      {/* Node Panel for adding nodes */}
      <NodePanel onAddNode={addNode} />
      
      {/* Graph Canvas */}
      <div className="flex-1 h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#aaa" gap={16} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {/* Properties Panel (when a node is selected) */}
      {selectedNode && (
        <div className="w-64 border-l p-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Node Properties</h3>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">Label</label>
            <input
              type="text"
              value={selectedNode.data.label}
              onChange={(e) => {
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === selectedNode.id
                      ? { ...n, data: { ...n.data, label: e.target.value } }
                      : n
                  )
                );
              }}
              className="w-full px-2 py-1 border rounded mt-1"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <input
              type="text"
              value={selectedNode.data.nodeType}
              readOnly
              className="w-full px-2 py-1 border rounded mt-1 bg-gray-100"
            />
          </div>
        </div>
      )}
    </div>
  );
}
