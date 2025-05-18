import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { validateEdgeConnection } from '@/utils/schemaUtils';

// Helper function to detect cycles in the graph
// Used for validating Loop nodes
function hasCycleToNode(targetNodeId: string, edges: Edge[], visited: Set<string> = new Set(), path: Set<string> = new Set(), currentNode?: string): boolean {
  // If no current node is specified, we need to check all possible starting points
  if (!currentNode) {
    // Get all nodes that have edges targeting our loop node
    const sourcesToTarget = edges
      .filter(e => e.target === targetNodeId)
      .map(e => e.source);
    
    // For each potential starting point, check if there's a path back to the target
    for (const source of sourcesToTarget) {
      if (hasCycleToNode(targetNodeId, edges, new Set(), new Set(), source)) {
        return true;
      }
    }
    return false;
  }
  
  // If we've already visited this node in the current path, we found a cycle
  if (path.has(currentNode)) {
    return true;
  }
  
  // If we've already visited this node in another path, no need to check again
  if (visited.has(currentNode)) {
    return false;
  }
  
  // Mark the current node as visited and add it to the current path
  visited.add(currentNode);
  path.add(currentNode);
  
  // Check all outgoing edges from the current node
  const outgoingEdges = edges.filter(e => e.source === currentNode);
  for (const edge of outgoingEdges) {
    // If we find a direct edge back to our target, we found a cycle
    if (edge.target === targetNodeId) {
      return true;
    }
    
    // Otherwise, continue searching from the target of this edge
    if (hasCycleToNode(targetNodeId, edges, visited, path, edge.target)) {
      return true;
    }
  }
  
  // Remove the current node from the path as we backtrack
  path.delete(currentNode);
  
  return false;
}

// Node types enum for improved type safety
export enum NodeType {
  START = 'startNode',
  END = 'endNode',
  AGENT = 'agentNode',
  TOOL = 'toolNode',
  MEMORY_READ = 'memoryReadNode',
  MEMORY_WRITE = 'memoryWriteNode',
  DECISION = 'decisionNode',
  PARALLEL_FORK = 'parallelForkNode',
  PARALLEL_JOIN = 'parallelJoinNode',
  LOOP = 'loopNode',
  ERROR_RETRY = 'errorRetryNode',
  TIMEOUT_GUARD = 'timeoutGuardNode',
  HUMAN_PAUSE = 'humanPauseNode',
  SUBGRAPH = 'subgraphNode',
  CUSTOM = 'customNode'
}

// Basic node interface
interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: { label: string; [key: string]: any };
  selected?: boolean;
  parentNode?: string;
  zIndex?: number;
}

// Edge condition types enum for improved type safety
export enum EdgeCondition {
  ALWAYS = 'always',
  SUCCESS = 'success',
  FAILURE = 'failure',
  CUSTOM = 'custom'
}

// Enhanced edge interface with additional properties
interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  animated?: boolean;
  style?: any;
  label?: string;
  data?: {
    condition?: EdgeCondition;
    customCondition?: string;
    branch?: string;
    priority?: number;
    parallelBranch?: boolean;
    isRetryEdge?: boolean;
  };
  selected?: boolean;
}

// Error messages for validation
const ERROR_MESSAGES = {
  START_NODE_EXISTS: 'A graph can only have one START node',
  INVALID_CONNECTION: 'This connection is not allowed',
  START_REQUIRED: 'A graph must have a START node',
  START_NO_INCOMING: 'START nodes cannot have incoming edges',
  START_ONE_OUTGOING: 'START node must have exactly one outgoing edge',
  END_REQUIRED: 'A graph must have at least one END node',
  END_UNREACHABLE: 'All END nodes must have at least one incoming edge',
  EDGE_FROM_END: 'END nodes cannot have outgoing edges',
  DUPLICATE_EDGE: 'This connection already exists',
  SELF_CONNECTION: 'A node cannot connect to itself',
  PARALLEL_FORK_MIN_EDGES: 'Parallel Fork nodes must have at least 2 outgoing edges',
  PARALLEL_JOIN_MIN_EDGES: 'Parallel Join nodes must have at least 2 incoming edges',
  LOOP_CYCLE_REQUIRED: 'Loop nodes must have a cycle',
};

interface GraphState {
  // Graph data
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  graphName: string;
  error: string | null; // For storing validation errors
  isValid: boolean; // Flag indicating if the graph is valid
  
  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, data: Partial<Node>) => void;
  removeNode: (id: string) => void;
  canAddEdge: (source: string, target: string) => { valid: boolean; message?: string };
  addEdge: (edge: Edge) => void;
  updateEdge: (id: string, data: Partial<Edge>) => void;
  removeEdge: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedEdgeId: (id: string | null) => void;
  setGraphName: (name: string) => void;
  clearGraph: () => void;
  validateGraph: () => { valid: boolean; message?: string };
  setError: (error: string | null) => void;
  
  // Node type specific actions
  addDecisionBranch: (nodeId: string, branchName: string) => void;
  removeDecisionBranch: (nodeId: string, branchIndex: number) => void;
  addLoopCycle: (loopNodeId: string, targetNodeId: string) => void;
  setNodeParent: (nodeId: string, parentId: string | null) => void;
}

// Create the store
export const useGraphStore = create<GraphState>()(
  persist(
    (set, get) => ({
      // Initial state
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      graphName: 'Untitled Graph',
      error: null,
      isValid: true,
      
      // Actions
      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
      
      // Validate and add a new node
      addNode: (node) => {
        // Check if we're adding a START node when one already exists
        if (node.type === NodeType.START && 
            get().nodes.some(n => n.type === NodeType.START)) {
          set({ error: ERROR_MESSAGES.START_NODE_EXISTS });
          return;
        }
        
        set((state) => ({ 
          nodes: [...state.nodes, node],
          error: null, // Clear any previous errors
        }));
        
        // Revalidate the graph after adding a node
        const { valid, message } = get().validateGraph();
        set({ isValid: valid, error: valid ? null : message || null });
      },
      
      // Update node data
      updateNode: (id, data) => set((state) => {
        const updatedNodes = state.nodes.map((node) =>
          node.id === id ? { ...node, ...data } : node
        );
        
        // Revalidate the graph after updating a node
        const newState = { nodes: updatedNodes };
        const { valid, message } = get().validateGraph();
        return {
          ...newState,
          isValid: valid,
          error: valid ? null : message || null
        };
      }),
      
      // Remove a node and all connected edges
      removeNode: (id) => set((state) => {
        const newState = {
          nodes: state.nodes.filter((node) => node.id !== id),
          edges: state.edges.filter(
            (edge) => edge.source !== id && edge.target !== id
          ),
          // Clear selection if the removed node was selected
          selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
        };
        
        // Revalidate the graph after removing a node
        const { valid, message } = get().validateGraph();
        return {
          ...newState,
          isValid: valid,
          error: valid ? null : message || null
        };
      }),
      
      // Validate edge before adding
      canAddEdge: (source, target) => {
        const state = get();
        const sourceNode = state.nodes.find(n => n.id === source);
        const targetNode = state.nodes.find(n => n.id === target);
        
        if (!sourceNode || !targetNode) {
          return { valid: false, message: 'Source or target node not found' };
        }
        
        // Self-connections are not allowed
        if (source === target) {
          return { valid: false, message: ERROR_MESSAGES.SELF_CONNECTION };
        }
        
        // END nodes cannot have outgoing edges
        if (sourceNode.type === NodeType.END) {
          return { valid: false, message: ERROR_MESSAGES.EDGE_FROM_END };
        }
        
        // Check if this edge already exists
        if (state.edges.some(e => e.source === source && e.target === target)) {
          return { valid: false, message: ERROR_MESSAGES.DUPLICATE_EDGE };
        }
        
        // Check type-specific connection rules
        if (!validateEdgeConnection(sourceNode.type, targetNode.type)) {
          return { valid: false, message: ERROR_MESSAGES.INVALID_CONNECTION };
        }
        
        return { valid: true };
      },
      
      // Add edge with validation
      addEdge: (edge) => {
        const { valid, message } = get().canAddEdge(edge.source, edge.target);
        
        if (!valid) {
          set({ error: message || ERROR_MESSAGES.INVALID_CONNECTION });
          return;
        }
        
        set((state) => ({
          edges: [...state.edges, edge],
          error: null, // Clear any previous errors
        }));
        
        // Revalidate the graph after adding an edge
        const validationResult = get().validateGraph();
        set({ 
          isValid: validationResult.valid, 
          error: validationResult.valid ? null : validationResult.message || null 
        });
      },
      
      // Update edge data
      updateEdge: (id, data) => set((state) => {
        const updatedEdges = state.edges.map((edge) =>
          edge.id === id ? { ...edge, ...data } : edge
        );
        
        return { edges: updatedEdges };
      }),
      
      // Remove an edge
      removeEdge: (id) => set((state) => {
        const newState = {
          edges: state.edges.filter((edge) => edge.id !== id),
          // Clear selection if the removed edge was selected
          selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId,
        };
        
        // Revalidate the graph after removing an edge
        const { valid, message } = get().validateGraph();
        return {
          ...newState,
          isValid: valid,
          error: valid ? null : message || null
        };
      }),
      
      // Set selected node ID
      setSelectedNodeId: (id) => set({
        selectedNodeId: id,
        // Deselect edge when selecting a node
        selectedEdgeId: null,
      }),
      
      // Set selected edge ID
      setSelectedEdgeId: (id) => set({
        selectedEdgeId: id,
        // Deselect node when selecting an edge
        selectedNodeId: null,
      }),
      
      // Set graph name
      setGraphName: (graphName) => set({ graphName }),
      
      // Clear the entire graph
      clearGraph: () => set({
        nodes: [],
        edges: [],
        selectedNodeId: null,
        selectedEdgeId: null,
        graphName: 'Untitled Graph',
        error: null,
        isValid: true,
      }),
      
      // Validate the entire graph
      validateGraph: () => {
        const state = get();
        
        // Check if there's exactly one START node
        const startNodes = state.nodes.filter(n => n.type === NodeType.START);
        if (startNodes.length === 0) {
          return { valid: false, message: ERROR_MESSAGES.START_REQUIRED };
        }
        if (startNodes.length > 1) {
          return { valid: false, message: ERROR_MESSAGES.START_NODE_EXISTS };
        }
        
        // Validate START node has exactly one outgoing edge and no incoming edges
        const startNodeId = startNodes[0].id;
        const startNodeOutgoingEdges = state.edges.filter(e => e.source === startNodeId);
        const startNodeIncomingEdges = state.edges.filter(e => e.target === startNodeId);
        
        if (startNodeOutgoingEdges.length !== 1) {
          return { valid: false, message: ERROR_MESSAGES.START_ONE_OUTGOING };
        }
        
        if (startNodeIncomingEdges.length > 0) {
          return { valid: false, message: ERROR_MESSAGES.START_NO_INCOMING };
        }
        
        // Check if there's at least one END node
        const endNodes = state.nodes.filter(n => n.type === NodeType.END);
        if (endNodes.length === 0) {
          return { valid: false, message: ERROR_MESSAGES.END_REQUIRED };
        }
        
        // Validate no outgoing edges from END nodes
        const endNodeIds = endNodes.map(n => n.id);
          
        const endNodeOutgoingEdges = state.edges.filter(e => endNodeIds.includes(e.source));
        if (endNodeOutgoingEdges.length > 0) {
          return { valid: false, message: ERROR_MESSAGES.EDGE_FROM_END };
        }
        
        // Make sure all END nodes have at least one incoming edge (no unreachable END nodes)
        const endNodesWithoutIncomingEdges = endNodeIds.filter(id => {
          return !state.edges.some(e => e.target === id);
        });
        
        if (endNodesWithoutIncomingEdges.length > 0) {
          return { valid: false, message: ERROR_MESSAGES.END_UNREACHABLE };
        }
        
        // Validate Parallel Fork nodes have at least 2 outgoing edges
        const parallelForkNodes = state.nodes.filter(n => n.type === NodeType.PARALLEL_FORK);
        for (const forkNode of parallelForkNodes) {
          const outgoingEdges = state.edges.filter(e => e.source === forkNode.id);
          if (outgoingEdges.length < 2) {
            return { valid: false, message: ERROR_MESSAGES.PARALLEL_FORK_MIN_EDGES };
          }
        }
        
        // Validate Parallel Join nodes have at least 2 incoming edges
        const parallelJoinNodes = state.nodes.filter(n => n.type === NodeType.PARALLEL_JOIN);
        for (const joinNode of parallelJoinNodes) {
          const incomingEdges = state.edges.filter(e => e.target === joinNode.id);
          if (incomingEdges.length < 2) {
            return { valid: false, message: ERROR_MESSAGES.PARALLEL_JOIN_MIN_EDGES };
          }
        }
        
        // Validate Loop nodes have at least one cycle
        const loopNodes = state.nodes.filter(n => n.type === NodeType.LOOP);
        for (const loopNode of loopNodes) {
          // Find if there's a path back to this loop node
          const hasCycle = hasCycleToNode(loopNode.id, state.edges);
          if (!hasCycle) {
            return { valid: false, message: ERROR_MESSAGES.LOOP_CYCLE_REQUIRED };
          }
        }
        
        return { valid: true };
      },
      
      // Set error message
      setError: (error) => set({ error }),
      
      // Add a new branch to a decision node
      addDecisionBranch: (nodeId, branchName) => set((state) => {
        const node = state.nodes.find(n => n.id === nodeId);
        if (!node || node.type !== NodeType.DECISION) return state;
        
        // Update the node's branches array
        const updatedNodes = state.nodes.map(n => {
          if (n.id === nodeId) {
            const currentBranches = n.data.branches || [];
            return {
              ...n,
              data: {
                ...n.data,
                branches: [...currentBranches, branchName]
              }
            };
          }
          return n;
        });
        
        return { nodes: updatedNodes };
      }),
      
      // Remove a branch from a decision node
      removeDecisionBranch: (nodeId, branchIndex) => set((state) => {
        const node = state.nodes.find(n => n.id === nodeId);
        if (!node || node.type !== NodeType.DECISION) return state;
        
        // Update the node's branches array
        const updatedNodes = state.nodes.map(n => {
          if (n.id === nodeId && n.data.branches) {
            const branches = [...n.data.branches];
            branches.splice(branchIndex, 1);
            return {
              ...n,
              data: { ...n.data, branches }
            };
          }
          return n;
        });
        
        return { nodes: updatedNodes };
      }),
      
      // Add a cycle connection for a loop node
      addLoopCycle: (loopNodeId, targetNodeId) => set((state) => {
        // Create a new edge from target to loop node to create a cycle
        const newEdge: Edge = {
          id: `edge-${loopNodeId}-${targetNodeId}-cycle`,
          source: targetNodeId,
          target: loopNodeId,
          animated: true,
          data: {
            condition: EdgeCondition.ALWAYS,
          }
        };
        
        return { edges: [...state.edges, newEdge] };
      }),
      
      // Set a node's parent (for subgraphs)
      setNodeParent: (nodeId, parentId) => set((state) => {
        const updatedNodes = state.nodes.map(n => {
          if (n.id === nodeId) {
            return {
              ...n,
              parentNode: parentId || undefined,
              // Increase zIndex when node is nested
              zIndex: parentId ? 10 : undefined
            };
          }
          return n;
        });
        
        return { nodes: updatedNodes };
      }),
    }),
    {
      name: 'langgraph-storage',
    }
  )
);

export default useGraphStore;

// Custom hook to access graph data conveniently
export const useGraph = () => {
  const nodes = useGraphStore(state => state.nodes);
  const edges = useGraphStore(state => state.edges);
  const graphName = useGraphStore(state => state.graphName);
  return { nodes, edges, graphName };
};
