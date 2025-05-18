import os
import tempfile
import subprocess
from pathlib import Path
from typing import Dict, List, Any, Optional

from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
from jinja2 import Template

# Create router
router = APIRouter(tags=["code_generator"])

# Define models for request validation
class NodePosition(BaseModel):
    x: float
    y: float

class NodeData(BaseModel):
    label: str
    model: Optional[str] = None
    temperature: Optional[float] = None
    maxTokens: Optional[int] = None
    modulePath: Optional[str] = None
    functionName: Optional[str] = None
    argsSchema: Optional[str] = None
    condition: Optional[str] = None
    branches: Optional[List[str]] = None
    outputFormat: Optional[str] = None
    finalTransform: Optional[str] = None

class Node(BaseModel):
    id: str
    type: str
    position: NodePosition
    data: NodeData

class Edge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None
    animated: Optional[bool] = True
    data: Optional[Dict[str, Any]] = None

class GraphSchema(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
    graphName: str

# Jinja2 template as a string constant
# This will be expanded based on real LangGraph needs
LANGGRAPH_TEMPLATE = '''
# Generated LangGraph code for: {{ graph_name }}

from langgraph.graph import StateGraph
from typing import Dict, List, Any, TypedDict, Literal, Union
from langchain_openai import ChatOpenAI
import json

# Define the state schema
class GraphState(TypedDict):
    input: str
    intermediate_steps: List[Any]
    output: str

# Initialize the graph
graph = StateGraph(GraphState)

# Define node functions
{% for node in nodes %}
{% if node.type == 'llmNode' %}
@graph.node
def {{ node.id|replace('-', '_') }}(state: GraphState) -> Dict[str, Any]:
    """{{ node.data.label }} - LLM processing node"""
    {% if node.data.model %}
    llm = ChatOpenAI(model="{{ node.data.model }}", temperature={{ node.data.temperature|default(0.7) }})
    {% else %}
    llm = ChatOpenAI(temperature={{ node.data.temperature|default(0.7) }})
    {% endif %}
    
    # Process with LLM
    response = llm.invoke(state["input"])
    return {"output": response.content}
{% endif %}

{% if node.type == 'toolNode' %}
@graph.node
def {{ node.id|replace('-', '_') }}(state: GraphState) -> Dict[str, Any]:
    """{{ node.data.label }} - Tool execution node"""
    # Import the tool's module dynamically
    {% if node.data.modulePath %}
    try:
        import {{ node.data.modulePath }}
        # Execute the function
        result = {{ node.data.modulePath }}.{{ node.data.functionName|default('execute') }}(state["input"])
        return {"output": result}
    except ImportError:
        return {"output": f"Error: Could not import module {{{ node.data.modulePath }}}", "error": True}
    {% else %}
    # No module path specified, use a placeholder
    return {"output": f"Tool would process: {state['input']}", "tool_called": True}
    {% endif %}
{% endif %}

{% if node.type == 'decisionNode' %}
@graph.node
def {{ node.id|replace('-', '_') }}(state: GraphState) -> Dict[str, str]:
    """{{ node.data.label }} - Decision node"""
    # Implement conditional logic
    {% if node.data.condition %}
    # This is a placeholder for condition evaluation
    # In a real implementation, this would evaluate the condition dynamically
    result = "default"
    # Example condition processing
    if "error" in state or state.get("output", "").lower().startswith("error"):
        result = "failure"
    elif "success" in state or len(state.get("output", "")) > 0:
        result = "success"
    return {"decision": result}
    {% else %}
    return {"decision": "default"}
    {% endif %}
{% endif %}

{% if node.type == 'endNode' %}
@graph.node
def {{ node.id|replace('-', '_') }}(state: GraphState) -> Dict[str, Any]:
    """{{ node.data.label }} - End node"""
    # Format the final output
    {% if node.data.outputFormat == 'json' %}
    try:
        if isinstance(state["output"], str):
            output = json.loads(state["output"])
        else:
            output = state["output"]
    except:
        output = {"result": state["output"]}
    {% elif node.data.outputFormat == 'markdown' %}
    output = f"```markdown\n{state['output']}\n```"
    {% else %}
    output = state["output"]
    {% endif %}
    
    return {"final_output": output}
{% endif %}
{% endfor %}

# Define the edges to connect the nodes
{% for node in nodes %}
graph.add_node({{ node.id|replace('-', '_') }})
{% endfor %}

{% for edge in edges %}
{% if edge.sourceHandle %}
# Conditional edge from {{ edge.source }} to {{ edge.target }} with condition {{ edge.sourceHandle }}
graph.add_conditional_edges(
    {{ edge.source|replace('-', '_') }},
    lambda state, result: result["decision"] == "{{ edge.sourceHandle }}",
    {"{{ edge.sourceHandle }}": {{ edge.target|replace('-', '_') }}}
)
{% else %}
# Direct edge from {{ edge.source }} to {{ edge.target }}
graph.add_edge({{ edge.source|replace('-', '_') }}, {{ edge.target|replace('-', '_') }})
{% endif %}
{% endfor %}

# Compile the graph
app = graph.compile()

# Function to run the graph
def run_graph(input_text: str) -> dict:
    """Execute the workflow with the given input"""
    result = app.invoke({"input": input_text, "intermediate_steps": [], "output": ""})
    return result

# Example usage
if __name__ == "__main__":
    result = run_graph("Hello, LangGraph!")
    print(result)
'''


@router.post("/generate_code", response_model=Dict[str, str])
async def generate_python_code(graph_schema: GraphSchema = Body(...)):
    """Convert graph JSON into Python code using a Jinja template"""
    try:
        # Create the Jinja2 template
        template = Template(LANGGRAPH_TEMPLATE)
        
        # Render the template with the graph data
        rendered_code = template.render(
            graph_name=graph_schema.graphName,
            nodes=graph_schema.nodes,
            edges=graph_schema.edges
        )
        
        # Save the rendered code to a temporary file
        with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode="w") as tmp_file:
            tmp_file.write(rendered_code)
            output_path = tmp_file.name
        
        # Verify that the generated code is valid Python
        result = subprocess.run(
            ["python", "-m", "py_compile", output_path],
            capture_output=True,
            text=True,
            check=False
        )
        
        if result.returncode != 0:
            raise HTTPException(
                status_code=400, 
                detail=f"Generated code has syntax errors: {result.stderr}"
            )
        
        # Return the path to the saved file and the code itself
        return {
            "file_path": output_path,
            "code": rendered_code
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
