import os
import json
from typing import Dict, Any, Optional, List
from pathlib import Path

# Path to store subgraph information
SUBGRAPH_REGISTRY_PATH = Path("./data/subgraph_registry")

def ensure_registry_exists():
    """Ensure the subgraph registry directory exists"""
    SUBGRAPH_REGISTRY_PATH.mkdir(parents=True, exist_ok=True)

def register_graph(graph_id: str, graph_data: Dict[str, Any], version: str = "latest"):
    """Register a graph so it can be used as a subgraph"""
    ensure_registry_exists()
    
    graph_dir = SUBGRAPH_REGISTRY_PATH / graph_id
    graph_dir.mkdir(exist_ok=True)
    
    version_file = graph_dir / f"{version}.json"
    with open(version_file, "w") as f:
        json.dump(graph_data, f, indent=2)
    
    # Update version index
    versions_file = graph_dir / "versions.json"
    versions = {"versions": ["latest"]}
    
    if versions_file.exists():
        with open(versions_file, "r") as f:
            versions = json.load(f)
    
    if version not in versions["versions"]:
        versions["versions"].append(version)
    
    with open(versions_file, "w") as f:
        json.dump(versions, f, indent=2)
    
    return {"graph_id": graph_id, "version": version}

def get_graph_data(graph_id: str, version: str = "latest") -> Optional[Dict[str, Any]]:
    """Get the data for a specific graph version"""
    ensure_registry_exists()
    
    graph_file = SUBGRAPH_REGISTRY_PATH / graph_id / f"{version}.json"
    if not graph_file.exists():
        return None
    
    with open(graph_file, "r") as f:
        return json.load(f)

def list_available_graphs() -> List[Dict[str, Any]]:
    """List all available graphs for use as subgraphs"""
    ensure_registry_exists()
    
    result = []
    for graph_dir in SUBGRAPH_REGISTRY_PATH.iterdir():
        if not graph_dir.is_dir():
            continue
            
        versions_file = graph_dir / "versions.json"
        if not versions_file.exists():
            continue
            
        with open(versions_file, "r") as f:
            versions = json.load(f)
        
        latest_file = graph_dir / "latest.json"
        metadata = {"name": graph_dir.name}
        
        if latest_file.exists():
            with open(latest_file, "r") as f:
                data = json.load(f)
                if "metadata" in data:
                    metadata.update(data["metadata"])
        
        result.append({
            "graph_id": graph_dir.name,
            "versions": versions["versions"],
            "metadata": metadata
        })
    
    return result

def infer_graph_interface(graph_data: Dict[str, Any]) -> Dict[str, List[str]]:
    """
    Analyze the graph data to infer the interface (inputs and outputs).
    This is used for mapping between the parent graph and subgraph.
    """
    # This is a simplified implementation
    # In a real-world scenario, we would analyze the START and END nodes
    # to determine what state keys the graph expects and produces
    
    inputs = ["input", "context"]  # Assume these are standard inputs
    outputs = ["output"]  # Assume this is the standard output
    
    # Look for START node to find initialState keys
    for node in graph_data.get("nodes", []):
        if node["type"] == "startNode":
            if "initialState" in node.get("data", {}):
                initial_state = node["data"]["initialState"]
                if isinstance(initial_state, dict):
                    inputs.extend(list(initial_state.keys()))
    
    # Look for END node to find output keys
    for node in graph_data.get("nodes", []):
        if node["type"] == "endNode":
            if "outputFormat" in node.get("data", {}):
                outputs.append("formatted_output")
    
    # Remove duplicates
    inputs = list(set(inputs))
    outputs = list(set(outputs))
    
    return {"inputs": inputs, "outputs": outputs}

def generate_subgraph_code(node_id: str, node_data: Dict[str, Any]) -> str:
    """Generate the code for a subgraph node"""
    graph_id = node_data.get("graphId", "")
    version = node_data.get("version", "latest")
    input_mapping = node_data.get("inputMapping", {})
    output_mapping = node_data.get("outputMapping", {})
    
    # In a real implementation, we would load the actual subgraph from the registry
    # and generate more sophisticated code to invoke it
    
    code = f"""
@graph.node
def {node_id.replace('-', '_')}(state: GraphState) -> Dict[str, Any]:
    \"\"\"Subgraph: {node_data.get('label', 'Unnamed Subgraph')}\"\"\"
    try:
        # Create a new state for the subgraph
        subgraph_state = {{"input": state.get("input", "")}}
        
        # Apply input mappings from parent graph to subgraph
        """
    
    # Generate input mapping code
    if input_mapping:
        for target, source in input_mapping.items():
            code += f"""
        # Map {source} to {target}
        if "{source}" in state:
            subgraph_state["{target}"] = state["{source}"]
        """
    
    code += f"""
        # Import and execute the subgraph
        # In a real implementation, this would use proper subgraph loading
        from app.utils.subgraph_utils import get_graph_data, execute_subgraph
        
        # Execute the subgraph with the prepared state
        subgraph_result = execute_subgraph(
            graph_id="{graph_id}",
            version="{version}",
            input_state=subgraph_state
        )
        
        # Prepare the output state
        result = {{}}
    """
    
    # Generate output mapping code
    if output_mapping:
        for target, source in output_mapping.items():
            code += f"""
        # Map subgraph output {source} to parent graph {target}
        if "{source}" in subgraph_result:
            result["{target}"] = subgraph_result["{source}"]
        """
    else:
        # Default mapping for output
        code += """
        # Default mapping for output
        if "output" in subgraph_result:
            result["output"] = subgraph_result["output"]
        """
    
    # Add error handling
    code += """
        # Copy any errors from the subgraph
        if "errors" in subgraph_result:
            if "errors" not in state:
                state["errors"] = []
            state["errors"].extend(subgraph_result["errors"])
            
        return result
    except Exception as e:
        # Capture any exceptions during subgraph execution
        error_info = {
            "node_id": node_id,
            "node_type": "subgraphNode",
            "error": str(e),
            "source": "subgraph_execution"
        }
        
        if "errors" not in state:
            state["errors"] = []
        state["errors"].append(error_info)
        
        return {"error": str(e), "status": "failed"}
    """
    
    return code

def execute_subgraph(graph_id: str, version: str, input_state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Execute a subgraph with the provided input state.
    This is a placeholder function that would be replaced with actual execution
    in a production environment using the LangGraph runtime.
    """
    # This is a mock implementation - in a real system, this would:
    # 1. Load the graph definition from storage
    # 2. Build the graph using LangGraph
    # 3. Execute the graph with the provided input state
    # 4. Return the result
    
    # Mock returning a simple result based on the input
    result = {
        "output": f"Executed subgraph {graph_id} (version: {version})",
        "status": "success"
    }
    
    # Add any input values to the output for demonstration
    for key, value in input_state.items():
        result[f"processed_{key}"] = value
    
    return result
