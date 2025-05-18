from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class Node(BaseModel):
    id: str = Field(..., description="Unique identifier for the node")
    type: str = Field(..., description="Type of the node, e.g., 'llm', 'prompt', 'tool'")
    data: Dict[str, Any] = Field(default_factory=dict, description="Configuration data for the node")
    position: Optional[Dict[str, float]] = Field(None, description="XY position for visualization")

class Edge(BaseModel):
    id: str = Field(..., description="Unique identifier for the edge")
    source_node_id: str = Field(..., description="ID of the source node")
    target_node_id: str = Field(..., description="ID of the target node")
    source_handle: Optional[str] = Field(None, description="Specific output handle on the source node")
    target_handle: Optional[str] = Field(None, description="Specific input handle on the target node")

class GraphData(BaseModel):
    nodes: List[Node] = Field(default_factory=list)
    edges: List[Edge] = Field(default_factory=list)
    # Additional graph-level metadata can be added here
    viewport: Optional[Dict[str, Any]] = Field(None, description="Viewport information for the graph editor")

class Graph(BaseModel):
    id: str = Field(..., description="Unique identifier for the graph")
    name: str = Field(default="Untitled Graph", description="Name of the graph")
    data: GraphData = Field(default_factory=GraphData)
    # Timestamps for tracking
    created_at: Optional[str] = None # Ideally, use datetime, but string for simplicity in JSON
    updated_at: Optional[str] = None
