from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel

# Create router
router = APIRouter(tags=["subgraph"])

# Define models
class GraphReference(BaseModel):
    graph_id: str
    version: str = "latest"
    name: Optional[str] = None

class SubgraphNodeConfig(BaseModel):
    graph_id: str
    version: str = "latest"
    input_mapping: Optional[Dict[str, str]] = None
    output_mapping: Optional[Dict[str, str]] = None
    description: Optional[str] = None

# In-memory graph registry for demonstration
# In a production system, this would be stored in a database
graph_registry = {}

@router.get("/graphs")
async def list_available_graphs():
    """
    List all available graphs that can be used as subgraphs.
    """
    return list(graph_registry.values())

@router.get("/graphs/{graph_id}")
async def get_graph_details(graph_id: str):
    """
    Get details about a specific graph by ID.
    """
    if graph_id not in graph_registry:
        raise HTTPException(status_code=404, detail=f"Graph with ID {graph_id} not found")
    return graph_registry[graph_id]

@router.get("/graphs/{graph_id}/versions")
async def list_graph_versions(graph_id: str):
    """
    List all available versions of a specific graph.
    """
    if graph_id not in graph_registry:
        raise HTTPException(status_code=404, detail=f"Graph with ID {graph_id} not found")
    
    # In a real implementation, this would query a database
    # For demonstration, we'll return a mock version list
    return {
        "graph_id": graph_id,
        "versions": ["latest", "1.0.0", "0.9.0"]
    }

@router.post("/graphs/register")
async def register_graph(graph_ref: GraphReference):
    """
    Register a graph to make it available as a subgraph.
    """
    graph_id = graph_ref.graph_id
    graph_registry[graph_id] = {
        "graph_id": graph_id,
        "version": graph_ref.version,
        "name": graph_ref.name or f"Graph-{graph_id}",
    }
    return graph_registry[graph_id]

@router.get("/graphs/{graph_id}/schema")
async def get_graph_schema(graph_id: str, version: str = "latest"):
    """
    Get the schema (inputs/outputs) of a graph to assist with mapping.
    """
    if graph_id not in graph_registry:
        raise HTTPException(status_code=404, detail=f"Graph with ID {graph_id} not found")
    
    # In a real implementation, this would load the actual schema
    # For demonstration, we'll return a mock schema
    return {
        "graph_id": graph_id,
        "version": version,
        "inputs": ["input", "context", "parameters"],
        "outputs": ["output", "status", "error"]
    }
