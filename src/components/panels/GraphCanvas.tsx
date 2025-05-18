"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  Controls,
  Background,
  BackgroundVariant,
  Panel,
  NodeChange,
  EdgeChange,
  XYPosition,
  OnConnectStartParams,
} from 'reactflow';
import 'reactflow/dist/style.css';
import useGraphStore from '@/store/graphStore';
import { validateEdgeConnection } from '@/utils/schemaUtils';

// Import custom node types
import LLMNode from '../nodes/LLMNode';
import ToolNode from '../nodes/ToolNode';
import DecisionNode from '../nodes/DecisionNode';
import EndNode from '../nodes/EndNode';
import StartNode from '../nodes/StartNode';
import AgentNode from '../nodes/AgentNode';
import MemoryReadNode from '../nodes/MemoryReadNode';
import MemoryWriteNode from '../nodes/MemoryWriteNode';
import ParallelForkNode from '../nodes/ParallelForkNode';
import ParallelJoinNode from '../nodes/ParallelJoinNode';
import LoopNode from '../nodes/LoopNode';
import ErrorRetryNode from '../nodes/ErrorRetryNode';
import TimeoutGuardNode from '../nodes/TimeoutGuardNode';

// JSON Import/Export Modal
import JSONModal from '../modals/JSONModal';

// Define node types
const nodeTypes: NodeTypes = {
  startNode: StartNode,
  llmNode: LLMNode,
  agentNode: AgentNode,
  toolNode: ToolNode,
  decisionNode: DecisionNode,
  endNode: EndNode,
  memoryReadNode: MemoryReadNode,
  memoryWriteNode: MemoryWriteNode,
  parallelForkNode: ParallelForkNode,
  parallelJoinNode: ParallelJoinNode,
  loopNode: LoopNode,
  errorRetryNode: ErrorRetryNode,
  timeoutGuardNode: TimeoutGuardNode,
};

// Node palette items
const nodeTemplates = [
  // Core Flow Nodes
  {
    type: 'startNode',
    label: 'START Node',
    description: 'Required entry point of the graph',
    className: 'bg-emerald-100 border-emerald-500',
  },
  {
    type: 'endNode',
    label: 'END Node',
    description: 'Graph termination',
    className: 'bg-red-100 border-red-500',
  },
  {
    type: 'decisionNode',
    label: 'Decision Node',
    description: 'Conditional branching logic',
    className: 'bg-yellow-100 border-yellow-500',
  },
  
  // AI Nodes
  {
    type: 'llmNode',
    label: 'LLM Node',
    description: 'Language model inference',
    className: 'bg-blue-100 border-blue-500',
  },
  {
    type: 'agentNode',
    label: 'Agent Node',
    description: 'LLM agent with tool calling',
    className: 'bg-purple-100 border-purple-500',
  },

  // Parallel Processing Nodes
  {
    type: 'parallelForkNode',
    label: 'Parallel Fork',
    description: 'Split into concurrent execution branches',
    className: 'bg-blue-100 border-blue-500',
  },
  {
    type: 'parallelJoinNode',
    label: 'Parallel Join',
    description: 'Merge results from parallel branches',
    className: 'bg-indigo-100 border-indigo-500',
  },
  {
    type: 'loopNode',
    label: 'Loop Node',
    description: 'Create cyclic execution patterns with exit conditions',
    className: 'bg-amber-100 border-amber-500',
  },
  {
    type: 'errorRetryNode',
    label: 'Error Retry',
    description: 'Automatically retry operations that fail with configurable backoff',
    className: 'bg-orange-100 border-orange-500',
  },
  {
    type: 'timeoutGuardNode',
    label: 'Timeout Guard',
    description: 'Protect against long-running operations with timeout policies',
    className: 'bg-purple-100 border-purple-500',
  },
  {
    type: 'toolNode',
    label: 'Tool Node',
    description: 'External tool or API call',
    className: 'bg-green-100 border-green-500',
  },
  
  // Memory Nodes
  {
    type: 'memoryReadNode',
    label: 'Memory Read',
    description: 'Retrieve data from memory',
    className: 'bg-cyan-100 border-cyan-500',
  },
  {
    type: 'memoryWriteNode',
    label: 'Memory Write',
    description: 'Store data in memory',
    className: 'bg-teal-100 border-teal-500',
  },
];

const GraphCanvas: React.FC = () => {
  // Get graph state and actions from store
  const { 
    nodes: storeNodes, 
    edges: storeEdges, 
    graphName,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    setSelectedNodeId,
  } = useGraphStore();
  
  // Local state for managing nodes and edges in ReactFlow
  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);
  
  // State for JSON import/export modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'import' | 'export'>('import');
  const [jsonContent, setJsonContent] = useState('');
  
  // Refs
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  
  // State for drag and drop
  const [onConnectStart, setOnConnectStart] = useState<OnConnectStartParams | null>(null);
  
  // Synchronize ReactFlow state with store
  useEffect(() => {
    setStoreNodes(nodes);
  }, [nodes, setStoreNodes]);
  
  useEffect(() => {
    setStoreEdges(edges);
  }, [edges, setStoreEdges]);
  
  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);
  
  // Handle edge selection
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    // You can expand the graphStore to also track selected edges if needed
    setSelectedNodeId(null); // Deselect any node when an edge is selected
  }, [setSelectedNodeId]);
  
  // Validate connection before allowing it
  const validateConnection = useCallback((connection: Connection) => {
    // Get the source and target nodes
    const sourceNode = nodes.find(node => node.id === connection.source);
    const targetNode = nodes.find(node => node.id === connection.target);
    
    if (!sourceNode || !targetNode) return false;
    
    // Use the validateEdgeConnection function from schemaUtils
    return validateEdgeConnection(
      sourceNode.type as string,
      targetNode.type as string,
      connection.sourceHandle || undefined,
      connection.targetHandle || undefined
    );
  }, [nodes]);
  
  // Handle node connections
  const onConnect = useCallback((connection: Connection) => {
    // If the connection is valid, add it to the graph
    if (validateConnection(connection)) {
      setEdges((eds) => addEdge({
        ...connection,
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      }, eds));
    } else {
      // Display an error toast or notification
      console.warn('Invalid connection: Loop structures must be created properly');
    }
  }, [setEdges, validateConnection]);
  
  // Handle drag and drop from sidebar palette
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow/type');
      const label = event.dataTransfer.getData('application/reactflow/label');
      
      // Check if we have data
      if (!type || !reactFlowInstance) return;

      // Get position from drop coordinates
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      // Create a new node
      const newNode: Node = {
        id: `${type}-${nodes.length + 1}`,
        type,
        position,
        data: { label },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, nodes, setNodes]
  );
  
  // Export graph to JSON
  const handleExportGraph = useCallback(() => {
    const graphData = {
      nodes,
      edges,
      graphName,
    };
    
    setJsonContent(JSON.stringify(graphData, null, 2));
    setModalMode('export');
    setIsModalOpen(true);
  }, [nodes, edges, graphName]);
  
  // Import graph from JSON
  const handleImportGraph = useCallback(() => {
    setJsonContent('');
    setModalMode('import');
    setIsModalOpen(true);
  }, []);
  
  // Process imported JSON
  const processImportedJSON = useCallback((jsonString: string) => {
    try {
      const parsedData = JSON.parse(jsonString);
      
      if (parsedData.nodes && Array.isArray(parsedData.nodes)) {
        setNodes(parsedData.nodes);
      }
      
      if (parsedData.edges && Array.isArray(parsedData.edges)) {
        setEdges(parsedData.edges);
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      alert('Invalid JSON format');
    }
  }, [setNodes, setEdges]);
  
  // Handle node dragging
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string, nodeLabel: string) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/label', nodeLabel);
    event.dataTransfer.effectAllowed = 'move';
  };
  
  return (
    <div className="h-full p-4 bg-gray-100 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Graph Canvas: {graphName}</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleImportGraph}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            Import
          </button>
          <button
            onClick={handleExportGraph}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
          >
            Export
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex">
        {/* Node Palette */}
        <div className="w-48 bg-white shadow-md rounded-l-md overflow-auto p-3">
          <h3 className="font-medium text-sm text-gray-700 mb-2">Node Types</h3>
          <div className="space-y-2">
            {nodeTemplates.map((template) => (
              <div
                key={template.type}
                className={`p-2 rounded border ${template.className} cursor-grab`}
                draggable
                onDragStart={(e) => onDragStart(e, template.type, template.label)}
              >
                <div className="text-sm font-medium">{template.label}</div>
                <div className="text-xs text-gray-600">{template.description}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* ReactFlow Canvas */}
        <div ref={reactFlowWrapper} className="flex-1 h-full rounded-r-md overflow-hidden">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              nodeTypes={nodeTypes}
              onDragOver={onDragOver}
              onDrop={onDrop}
              fitView
            >
              <Background variant="dots" gap={12} size={1} />
              <Controls />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
      
      {/* JSON Modal */}
      {isModalOpen && (
        <JSONModal
          isOpen={isModalOpen}
          mode={modalMode}
          content={jsonContent}
          onClose={() => setIsModalOpen(false)}
          onSubmit={modalMode === 'import' ? processImportedJSON : undefined}
        />
      )}
    </div>
  );
};

// Wrap with ReactFlowProvider when exporting
export default function GraphCanvasWrapper() {
  return (
    <ReactFlowProvider>
      <GraphCanvas />
    </ReactFlowProvider>
  );
}
