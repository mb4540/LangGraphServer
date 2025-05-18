import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: { label: string; [key: string]: any };
}

interface Edge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  style?: any;
}

interface GraphState {
  // Graph data
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  graphName: string;
  
  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, data: Partial<Node>) => void;
  removeNode: (id: string) => void;
  addEdge: (edge: Edge) => void;
  updateEdge: (id: string, data: Partial<Edge>) => void;
  removeEdge: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedEdgeId: (id: string | null) => void;
  setGraphName: (name: string) => void;
  clearGraph: () => void;
}

// Create the store
export const useGraphStore = create<GraphState>()(
  persist(
    (set) => ({
      // Initial state
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      graphName: 'Untitled Graph',
      
      // Actions
      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
      addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
      updateNode: (id, data) => set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === id ? { ...node, ...data } : node
        ),
      })),
      removeNode: (id) => set((state) => ({
        nodes: state.nodes.filter((node) => node.id !== id),
        edges: state.edges.filter(
          (edge) => edge.source !== id && edge.target !== id
        ),
      })),
      addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
      updateEdge: (id, data) => set((state) => ({
        edges: state.edges.map((edge) =>
          edge.id === id ? { ...edge, ...data } : edge
        ),
      })),
      removeEdge: (id) => set((state) => ({
        edges: state.edges.filter((edge) => edge.id !== id),
      })),
      setSelectedNodeId: (id) => set({
        selectedNodeId: id,
        // Deselect edge when selecting a node
        selectedEdgeId: null,
      }),
      setSelectedEdgeId: (id) => set({
        selectedEdgeId: id,
        // Deselect node when selecting an edge
        selectedNodeId: null,
      }),
      setGraphName: (graphName) => set({ graphName }),
      clearGraph: () => set({
        nodes: [],
        edges: [],
        selectedNodeId: null,
        selectedEdgeId: null,
        graphName: 'Untitled Graph'
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
