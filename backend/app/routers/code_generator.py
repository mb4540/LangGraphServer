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

# Standard imports
import json
import asyncio
from typing import Dict, List, Any, TypedDict, Literal, Union, Annotated, Callable, Optional

# LangGraph imports
from langgraph.graph import StateGraph
from langgraph.prebuilt import ToolNode, AgentNode
from langgraph.prebuilt.memory import MemoryReadNode, MemoryWriteNode
from langgraph.prebuilt.retry import RetryHandler, RetryPolicy
from langgraph.checkpoint import Checkpoint

# Local imports
from app.utils.tool_helpers import create_tool_executor
from app.utils.tool_utils import get_tool_by_name, collect_available_tools
from app.utils.memory_utils import read_memory, write_memory

# LangChain imports
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.runnables import RunnableConfig

# Define the state schema with flexible structure for all node types
class GraphState(TypedDict):
    input: str
    intermediate_steps: List[Any]
    output: str
    memory: Dict[str, Any]  # For Memory Read/Write nodes
    context: Dict[str, Any]  # For additional context storage
    tool_results: Dict[str, Any]  # For tool outputs
    agent_messages: List[Dict[str, Any]]  # For agent conversation history
    errors: List[Dict[str, Any]]  # For error tracking

# Initialize memory checkpoint for persistence
checkpoint = Checkpoint(
    'memory_checkpoint',  # A name for the checkpoint
    dir='./checkpoints'  # Directory to store checkpoints
)

# Initialize the graph with the checkpoint
graph = StateGraph(GraphState, checkpoint=checkpoint)

# Define node functions
{% for node in nodes %}
{% if node.type == 'startNode' %}
@graph.node("start")
def {{ node.id|replace('-', '_') }}(state: GraphState) -> Dict[str, Any]:
    """{{ node.data.label }} - START node that initializes the graph execution"""
    # This node is the required entry point of the graph
    # It can be used to initialize state if needed
    {% if node.data.initialState %}
    # Initialize state with custom values
    initial_context = {{ node.data.initialState }}
    return {"context": initial_context}
    {% else %}
    # Pass through input with a simple message indicating the graph has started
    return {"context": {"status": "Graph execution started"}}
    {% endif %}
{% endif %}

{% if node.type == 'endNode' %}
@graph.node("end")
def {{ node.id|replace('-', '_') }}(state: GraphState) -> Dict[str, Any]:
    """{{ node.data.label }} - END node that marks successful completion"""
    # Format the final output based on the specified format
    {% if node.data.outputFormat == 'json' %}
    try:
        if isinstance(state.get("output", ""), str):
            output = json.loads(state["output"])
        else:
            output = state.get("output", {})
    except:
        output = {"result": state.get("output", "No output")}
    {% elif node.data.outputFormat == 'markdown' %}
    output = f"```markdown
{state.get('output', 'No output')}
```"
    {% else %}
    output = state.get("output", "No output")
    {% endif %}
    
    # Apply any final transformation if specified
    {% if node.data.finalTransform %}
    # Custom transformation logic here
    try:
        # This is a placeholder for a custom transformation
        # In a real implementation, this would be a more sophisticated function
        if isinstance(output, dict):
            output = {**output, "transformed": True}
        elif isinstance(output, str):
            output = f"Transformed: {output}"
    except Exception as e:
        output = f"Error in final transformation: {str(e)}"
    {% endif %}
    
    return {"final_output": output}
{% endif %}

{% if node.type == 'agentNode' %}
@graph.node
def {{ node.id|replace('-', '_') }}(state: GraphState) -> Dict[str, Any]:
    """{{ node.data.label }} - Agent node that can call tools in a loop"""
    # Create the agent based on the specified type
    {% if node.data.agentType == 'react' %}
    # ReAct style agent with tool calling capabilities
    agent = AgentNode(
        llm=ChatOpenAI(
            model="{{ node.data.model|default('gpt-4') }}",
            temperature={{ node.data.temperature|default(0.7) }}{% if node.data.maxTokens %},
            max_tokens={{ node.data.maxTokens }}{% endif %}
        ),
        tools=get_tools(),  # Function to collect all available tools
        {% if node.data.systemPrompt %}
        system_prompt="{{ node.data.systemPrompt }}",
        {% endif %}
    )
    
    # Invoke the agent with the input
    input_data = state.get("input", "")
    if isinstance(input_data, dict):
        # Format dict input as a user message
        input_message = HumanMessage(content=str(input_data))
    else:
        input_message = HumanMessage(content=str(input_data))
        
    response = agent.invoke({"messages": [input_message]})
    return {
        "output": response.get("output", ""),
        "agent_messages": response.get("messages", [])
    }
    
    {% elif node.data.agentType == 'planAndExecute' %}
    # Planning agent that first creates a plan, then executes it
    # Create a planner LLM
    planner_llm = ChatOpenAI(
        model="{{ node.data.model|default('gpt-4') }}",
        temperature={{ node.data.temperature|default(0.7) }},
    )
    
    # Create an executor LLM
    executor_llm = ChatOpenAI(
        model="{{ node.data.model|default('gpt-4') }}",
        temperature={{ node.data.temperature|default(0.7) }},
    )
    
    # Plan and execute based on the input
    input_data = state.get("input", "")
    
    # First, create a plan
    plan_prompt = f"Create a step-by-step plan to solve: {input_data}"
    plan = planner_llm.invoke(plan_prompt).content
    
    # Then execute the plan
    execution_prompt = f"Execute this plan:
{plan}

Task: {input_data}"
    result = executor_llm.invoke(execution_prompt).content
    
    return {
        "output": result,
        "context": {"plan": plan, "execution": result}
    }
    
    {% else %}
    # Default to simple LLM processing
    {% if node.data.model %}
    llm = ChatOpenAI(model="{{ node.data.model }}", temperature={{ node.data.temperature|default(0.7) }})
    {% else %}
    llm = ChatOpenAI(temperature={{ node.data.temperature|default(0.7) }})
    {% endif %}
    
    # Process with LLM
    input_content = state.get("input", "")
    response = llm.invoke(input_content)
    return {"output": response.content}
    {% endif %}
{% endif %}

{% if node.type == 'memoryReadNode' %}
# Create Memory Read Node for {{ node.id|replace('-', '_') }}
{{ node.id|replace('-', '_') }} = MemoryReadNode(
    name="{{ node.data.label }}",
    memory_type="{{ node.data.memoryType }}",
    read_fn=lambda state: read_memory(
        memory_type="{{ node.data.memoryType }}",
        key={% if node.data.key %}"{{ node.data.key }}"{% else %}None{% endif %},
        namespace={% if node.data.namespace %}"{{ node.data.namespace }}"{% else %}None{% endif %},
        filter_expr={% if node.data.filter %}"{{ node.data.filter }}"{% else %}None{% endif %}
    )
)

# Register the Memory Read Node with the graph
graph.add_node({{ node.id|replace('-', '_') }})
{% endif %}

{% if node.type == 'memoryWriteNode' %}
# Create Memory Write Node for {{ node.id|replace('-', '_') }}
{{ node.id|replace('-', '_') }} = MemoryWriteNode(
    name="{{ node.data.label }}",
    memory_type="{{ node.data.memoryType }}",
    write_fn=lambda state, value: write_memory(
        memory_type="{{ node.data.memoryType }}",
        key="{{ node.data.key }}",
        value=value,
        namespace={% if node.data.namespace %}"{{ node.data.namespace }}"{% else %}None{% endif %},
        ttl={% if node.data.ttl %}{{ node.data.ttl }}{% else %}None{% endif %},
        overwrite_existing={{ node.data.overwriteExisting|default(true) }}
    )
)

# Register the Memory Write Node with the graph
graph.add_node({{ node.id|replace('-', '_') }})
{% endif %}

{% if node.type == 'toolNode' %}
# Create Tool Node for {{ node.id|replace('-', '_') }}
{% if node.data.modulePath and node.data.functionName %}
try:
    # Get the function dynamically from the module
    {{ node.data.functionName }}_func = get_tool_by_name("{{ node.data.functionName }}", "{{ node.data.modulePath }}")
    
    # Configure the tool executor with concurrency and error handling settings
    tool_executor = create_tool_executor(
        {{ node.data.functionName }}_func,
        concurrency={{ node.data.concurrency|default(1) }},
        error_handling="{{ node.data.errorHandling|default('fail') }}",
        max_retries={{ node.data.maxRetries|default(3) }},
        {% if node.data.timeout %}timeout={{ node.data.timeout }},{% endif %}
    )
    
    # Create the tool definition
    {{ node.id|replace('-', '_') }}_tools = {
        "{{ node.data.functionName }}": {
            "func": lambda x: asyncio.run(tool_executor(x)),
            "description": "{{ node.data.label }} - {{ node.data.functionName }} from {{ node.data.modulePath }}"
        }
    }
except ImportError as e:
    # Fallback for import errors
    print(f"Warning: Could not import {{ node.data.functionName }} from {{ node.data.modulePath }}: {e}")
    {{ node.id|replace('-', '_') }}_tools = {
        "{{ node.data.functionName }}": {
            "func": lambda x: f"Error: Could not import {{ node.data.functionName }} from {{ node.data.modulePath }}",
            "description": "[ERROR] {{ node.data.label }} - {{ node.data.functionName }} (import failed)"
        }
    }
{% else %}
# No module path specified, use a placeholder function
{{ node.id|replace('-', '_') }}_tools = {
    "dummy_tool": {
        "func": lambda x: f"Tool would process: {x}",
        "description": "{{ node.data.label }} - placeholder tool"
    }
}
{% endif %}

# Using LangGraph's prebuilt ToolNode
{{ node.id|replace('-', '_') }} = ToolNode(
    name="{{ node.data.label }}",
    tools={{ node.id|replace('-', '_') }}_tools,
    {% if node.data.argsSchema %}
    args_schema={{ node.data.argsSchema }},
    {% endif %}
)

# Register the ToolNode with the graph
graph.add_node({{ node.id|replace('-', '_') }})
{% endif %}

{% if node.type == 'memoryReadNode' %}
# Using LangGraph's prebuilt MemoryReadNode for {{ node.id|replace('-', '_') }}
{{ node.id|replace('-', '_') }} = MemoryReadNode(
    key="{{ node.data.key|default('default_memory') }}",
    memory_type="{{ node.data.memoryType|default('thread') }}"
)

# Register the MemoryReadNode with the graph
graph.add_node({{ node.id|replace('-', '_') }})
{% endif %}

{% if node.type == 'memoryWriteNode' %}
# Using LangGraph's prebuilt MemoryWriteNode for {{ node.id|replace('-', '_') }}
{{ node.id|replace('-', '_') }} = MemoryWriteNode(
    key="{{ node.data.key|default('default_memory') }}",
    memory_type="{{ node.data.memoryType|default('thread') }}"
)

# Register the MemoryWriteNode with the graph
graph.add_node({{ node.id|replace('-', '_') }})
{% endif %}

{% if node.type == 'decisionNode' %}
@graph.node
def {{ node.id|replace('-', '_') }}(state: GraphState) -> Dict[str, str]:
    """{{ node.data.label }} - Decision node that routes based on a predicate"""
    # Implement conditional routing logic
    {% if node.data.condition %}
    # This is the condition evaluation
    try:
        # Get relevant state values
        input_value = state.get("input", "")
        output_value = state.get("output", "")
        context = state.get("context", {})
        errors = state.get("errors", [])
        
        # Evaluate the condition (placeholder logic)
        # You'd replace this with more sophisticated condition evaluation
        if errors:
            result = "failure"
        elif not output_value:
            result = "default"
        else:
            result = "success"
            
        # Check for specific branches if defined
        {% if node.data.branches %}
        # Get the first branch as default
        if result not in {{ node.data.branches }}:
            result = "{{ node.data.branches[0] }}"
        {% endif %}
            
        return {"decision": result}
    except Exception as e:
        # If condition evaluation fails, return default
        {% if node.data.defaultBranch %}
        return {"decision": "{{ node.data.defaultBranch }}"}
        {% else %}
        return {"decision": "default"}
        {% endif %}
    {% else %}
    # No condition specified, use default branch
    {% if node.data.defaultBranch %}
    return {"decision": "{{ node.data.defaultBranch }}"}
    {% else %}
    return {"decision": "default"}
    {% endif %}
    {% endif %}
{% endif %}
{% endfor %}

{% if node.type == 'parallelForkNode' %}
@graph.node
def {{ node.id|replace('-', '_') }}(state: GraphState) -> Dict[str, Any]:
    """{{ node.data.label }} - Parallel Fork node that fans-out to concurrent branches"""
    # This node splits execution into parallel branches
    # In LangGraph, we handle this by returning the same state
    # and then configuring multiple outbound edges
    return state
{% endif %}

{% if node.type == 'parallelJoinNode' %}
@graph.node
def {{ node.id|replace('-', '_') }}(state: GraphState) -> Dict[str, Any]:
    """{{ node.data.label }} - Parallel Join node that merges incoming branches"""
    # This node merges results from parallel branches
    # In the actual code, LangGraph handles this automatically
    # based on the graph structure
    
    # Implement custom merge strategy if specified
    {% if node.data.mergeStrategy == 'custom' and node.data.customMerger %}
    # Custom merger would be implemented here
    # The implementation would depend on the specific requirements
    return state
    {% elif node.data.mergeStrategy == 'concat' %}
    # Concatenate results strategy
    # This is a simple example of concatenating string outputs
    if 'parallel_results' in state:
        concatenated = '
'.join([str(r) for r in state['parallel_results']])
        return {**state, 'output': concatenated}
    else:
        return state
    {% else %}
    # Default merge strategy (just use the state as is)
    return state
    {% endif %}
{% endif %}

{% if node.type == 'loopNode' %}
@graph.node
def {{ node.id|replace('-', '_') }}(state: GraphState) -> Dict[str, str]:
    """{{ node.data.label }} - Loop node that creates cyclic execution"""
    # Check if we should continue looping or exit
    # This is a placeholder implementation that would be customized based on the actual condition
    {% if node.data.condition %}
    # Get the current iteration count from the state
    iterations = state.get('loop_iterations', {}).get('{{ node.id|replace('-', '_') }}', 0)
    
    # Check if we've reached the maximum iterations
    if iterations >= {{ node.data.maxIterations|default(10) }}:
        return {'decision': 'exit'}
    
    # Update the iteration count
    new_iterations = iterations + 1
    loop_iterations = state.get('loop_iterations', {})
    loop_iterations['{{ node.id|replace('-', '_') }}'] = new_iterations
    
    # Evaluate the condition (placeholder logic)
    try:
        # This would be replaced with actual condition evaluation
        # For now, we'll use a simple placeholder
        if 'output' in state and len(state['output']) > 0:
            # Check if the output contains 'done' or 'complete'
            output = state['output'].lower()
            if 'done' in output or 'complete' in output:
                return {'decision': 'exit'}
        
        # Continue looping
        return {
            'decision': 'continue',
            'loop_iterations': loop_iterations
        }
    except Exception as e:
        # If condition evaluation fails, exit the loop
        return {'decision': 'exit'}
    {% else %}
    # No condition specified, always continue looping up to max iterations
    iterations = state.get('loop_iterations', {}).get('{{ node.id|replace('-', '_') }}', 0)
    if iterations >= {{ node.data.maxIterations|default(10) }}:
        return {'decision': 'exit'}
    
    # Update the iteration count
    loop_iterations = state.get('loop_iterations', {})
    loop_iterations['{{ node.id|replace('-', '_') }}'] = iterations + 1
    
    return {
        'decision': 'continue',
        'loop_iterations': loop_iterations
    }
    {% endif %}
{% endif %}

{% if node.type == 'errorRetryNode' %}
# Create a retry handler for {{ node.id|replace('-', '_') }}
{{ node.id|replace('-', '_') }}_retry_policy = RetryPolicy(
    max_retries={{ node.data.maxRetries|default(3) }},
    backoff_type="{{ node.data.backoffType|default('exponential') }}",
    initial_delay={{ node.data.initialDelayMs|default(1000) }} / 1000.0,  # Convert ms to seconds
    max_delay={{ node.data.maxDelayMs|default(30000) }} / 1000.0,  # Convert ms to seconds
    jitter={{ 'true' if node.data.jitter|default(true) else 'false' }}
)

# Create the retry handler function
@graph.node
def {{ node.id|replace('-', '_') }}(state: GraphState) -> Dict[str, Any]:
    """{{ node.data.label }} - Error Retry node with configurable policy"""
    # Check if there's an error in the state
    if state.get('errors', []):
        # Get the last error
        last_error = state['errors'][-1]
        
        # Decide whether to retry based on the retry policy
        # In a real implementation, this would be handled by LangGraph's retry policy
        return {
            'should_retry': True,
            'retry_count': state.get('retry_count', {}).get('{{ node.id|replace('-', '_') }}', 0) + 1
        }
    
    # No error, just pass through the state
    return state
{% endif %}

{% if node.type == 'timeoutGuardNode' %}
@graph.node
def {{ node.id|replace('-', '_') }}(state: GraphState) -> Dict[str, Any]:
    """{{ node.data.label }} - Timeout Guard node that interrupts long-running operations"""
    # Timeout guards are typically implemented at the graph execution level
    # rather than as nodes, so this is just a placeholder
    # In a real implementation, this would be handled by LangGraph's timeout mechanisms
    
    # Just pass through the state
    return state
{% endif %}

{% if node.type == 'humanPauseNode' %}
# Human-in-the-loop node that pauses for intervention
@graph.node
def {{ node.id|replace('-', '_') }}(state: GraphState) -> Dict[str, Any]:
    """{{ node.data.label }} - Human Pause node for manual intervention"""
    # Add a message in the state to indicate that human input is needed
    return {
        **state,
        'human_intervention': {
            'required': True,
            'message': "{{ node.data.pauseMessage|default('Waiting for human input') }}",
            'allow_edits': {{ 'true' if node.data.allowEdits|default(true) else 'false' }},
            {% if node.data.requiredFields %}
            'required_fields': {{ node.data.requiredFields }},
            {% endif %}
            'node_id': '{{ node.id }}'
        }
    }
{% endif %}

{% if node.type == 'subgraphNode' %}
# Import the subgraph module
# This would need to be customized based on where subgraphs are stored
try:
    # Try to import the subgraph by ID
    from subgraphs import {{ node.data.graphId|replace('-', '_') }}
    
    # Create a node that will invoke the subgraph
    @graph.node
    def {{ node.id|replace('-', '_') }}(state: GraphState) -> Dict[str, Any]:
        """{{ node.data.label }} - Subgraph node that encapsulates a complete graph"""
        # Prepare the input for the subgraph
        subgraph_input = {}
        
        # Map inputs if specified
        {% if node.data.inputMapping %}
        for subgraph_key, main_key in {{ node.data.inputMapping }}.items():
            # Extract the value from the main graph state
            if main_key in state:
                subgraph_input[subgraph_key] = state[main_key]
        {% else %}
        # Default: pass the current state as is
        subgraph_input = state
        {% endif %}
        
        # Invoke the subgraph
        subgraph_result = {{ node.data.graphId|replace('-', '_') }}.run_graph(subgraph_input)
        
        # Map outputs if specified
        {% if node.data.outputMapping %}
        result = {}
        for main_key, subgraph_key in {{ node.data.outputMapping }}.items():
            # Extract the value from the subgraph result
            if subgraph_key in subgraph_result:
                result[main_key] = subgraph_result[subgraph_key]
        return result
        {% else %}
        # Default: return the subgraph result as is
        return subgraph_result
        {% endif %}

except ImportError:
    # If the subgraph module can't be imported, create a placeholder node
    @graph.node
    def {{ node.id|replace('-', '_') }}(state: GraphState) -> Dict[str, Any]:
        """{{ node.data.label }} - Subgraph node (PLACEHOLDER)"""
        return {
            **state,
            'error': f"Could not import subgraph {{ node.data.graphId }}"
        }
{% endif %}

{% if node.type == 'customNode' %}
@graph.node
def {{ node.id|replace('-', '_') }}(state: GraphState) -> Dict[str, Any]:
    """{{ node.data.label }} - Custom function node"""
    # A custom function with user-defined code
    # SECURITY RISK: This executes arbitrary code and should be properly sanitized
    # For now, we'll wrap it in a try-except block
    try:
        # Execute the function body in a limited context
        # This is a placeholder implementation
        
        {% if node.data.language == 'python' %}
        # Define a safe global context
        safe_globals = {
            'state': state,
            'json': json,
            'dict': dict,
            'list': list,
            'str': str,
            'int': int,
            'float': float,
            'bool': bool,
            'len': len,
            'range': range,
            'sum': sum,
            'min': min,
            'max': max,
            'all': all,
            'any': any,
            'sorted': sorted,
            'enumerate': enumerate,
            'zip': zip,
            'filter': filter,
            'map': map,
        }
        
        # Set up the function code
        function_code = """
{{ node.data.functionBody }}
"""
        
        # Create a local namespace
        local_vars = {}
        
        # Execute the function code
        exec(function_code, safe_globals, local_vars)
        
        # If the function defines a 'result', return it
        if 'result' in local_vars:
            return local_vars['result']
        else:
            return {
                **state,
                'custom_output': 'Custom function executed but no result defined'
            }
        {% else %}
        # JavaScript functions aren't directly supported
        # In a real implementation, you might use a JS engine like V8
        return {
            **state,
            'error': 'JavaScript custom functions are not supported in this template'
        }
        {% endif %}
    except Exception as e:
        # If the function execution fails, return an error
        return {
            **state,
            'error': f"Error executing custom function: {str(e)}"
        }
{% endif %}
{% endfor %}

# Register nodes with the graph
# For the nodes that haven't been registered in-place
{% for node in nodes %}
{% if node.type not in ['toolNode', 'memoryReadNode', 'memoryWriteNode'] %}
graph.add_node({{ node.id|replace('-', '_') }})
{% endif %}
{% endfor %}

# Define the edges to connect the nodes
{% for edge in edges %}

{# Handle conditional edges from decision nodes #}
{% if edge.sourceHandle and 'decision' in edge.sourceHandle %}
# Conditional edge from {{ edge.source }} (Decision node) to {{ edge.target }} with condition {{ edge.sourceHandle }}
graph.add_conditional_edges(
    {{ edge.source|replace('-', '_') }},
    lambda state, result: result.get("decision", "default") == "{{ edge.sourceHandle|replace('decision.', '') }}", 
    {"{{ edge.sourceHandle|replace('decision.', '') }}": {{ edge.target|replace('-', '_') }}}
)

{# Handle conditional edges from loop nodes #}
{% elif edge.sourceHandle and 'loop' in edge.sourceHandle %}
# Loop control edge from {{ edge.source }} to {{ edge.target }} with condition {{ edge.sourceHandle }}
{% if 'continue' in edge.sourceHandle %}
graph.add_conditional_edges(
    {{ edge.source|replace('-', '_') }},
    lambda state, result: result.get("decision", "") == "continue",
    {"continue": {{ edge.target|replace('-', '_') }}}
)
{% elif 'exit' in edge.sourceHandle %}
graph.add_conditional_edges(
    {{ edge.source|replace('-', '_') }},
    lambda state, result: result.get("decision", "") == "exit",
    {"exit": {{ edge.target|replace('-', '_') }}}
)
{% endif %}

{# Handle edges from error retry nodes #}
{% elif edge.sourceHandle and 'retry' in edge.sourceHandle %}
# Retry control edge from {{ edge.source }} to {{ edge.target }} with condition {{ edge.sourceHandle }}
{% if 'should_retry' in edge.sourceHandle %}
graph.add_conditional_edges(
    {{ edge.source|replace('-', '_') }},
    lambda state, result: result.get("should_retry", False),
    {"should_retry": {{ edge.target|replace('-', '_') }}}
)
{% elif 'continue' in edge.sourceHandle %}
graph.add_conditional_edges(
    {{ edge.source|replace('-', '_') }},
    lambda state, result: not result.get("should_retry", False),
    {"continue": {{ edge.target|replace('-', '_') }}}
)
{% endif %}

{# Handle parallel fork edges #}
{% elif 'parallelForkNode' in edge.source|string() %}
# Parallel branch from {{ edge.source }} (Fork node) to {{ edge.target }}
# In LangGraph, parallel branches can be created using branches parameter
# Here, we're using a simple edge to represent the parallel execution
graph.add_edge({{ edge.source|replace('-', '_') }}, {{ edge.target|replace('-', '_') }})

{# Handle parallel join edges #}
{% elif 'parallelJoinNode' in edge.target|string() %}
# Input to Parallel Join node from {{ edge.source }} to {{ edge.target }}
# These edges represent inputs to the join node that will be merged
graph.add_edge({{ edge.source|replace('-', '_') }}, {{ edge.target|replace('-', '_') }})

{# Handle standard direct edges #}
{% else %}
# Direct edge from {{ edge.source }} to {{ edge.target }}
graph.add_edge({{ edge.source|replace('-', '_') }}, {{ edge.target|replace('-', '_') }})
{% endif %}
{% endfor %}

# Set the entry/start node(s) if not explicitly specified
# Entry point setup is required for LangGraph to know where to start execution
{% set has_start = false %}
{% for node in nodes if node.type == 'startNode' %}
# Using {{ node.id|replace('-', '_') }} as the graph's entry point
{% set has_start = true %}
graph.set_entry_point("{{ node.id|replace('-', '_') }}")
{% endfor %}

{# Fallback if no explicit start node #}
{% if not has_start %}
# No explicit START node found, using the first node as entry point
# This is a fallback mechanism and should be avoided in production
graph.set_entry_point("{{ nodes[0].id|replace('-', '_') }}")
{% endif %}

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
