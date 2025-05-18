import React, { useEffect, useState } from 'react';
import { useGraph } from '@/store/graphStore';

// Function to format Python code with syntax highlighting
const formatPythonCode = (code: string): React.ReactNode => {
  if (!code) return null;
  
  // Split the code into lines
  const lines = code.split('\n');
  
  // Define regex patterns for different Python syntax elements
  const patterns = {
    keyword: /\b(def|class|import|from|return|if|else|elif|for|while|try|except|finally|with|as|in|is|not|and|or|True|False|None|async|await|yield)\b/g,
    function: /\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/g,
    string: /(['"])(.*?)\1/g,
    comment: /#.*/g,
    decorator: /@[a-zA-Z_][a-zA-Z0-9_\.]*/g,
    className: /\b([A-Z][a-zA-Z0-9_]*)\b/g,
    number: /\b\d+(\.\d+)?\b/g
  };
  
  // Process each line and apply highlighting
  return lines.map((line, index) => {
    let highlightedLine = line;
    
    // Apply syntax highlighting for each pattern
    // We need to process comments first to avoid highlighting inside comments
    highlightedLine = highlightedLine.replace(patterns.comment, '<span class="comment">$&</span>');
    
    // Then process strings to avoid highlighting keywords inside strings
    highlightedLine = highlightedLine.replace(patterns.string, '<span class="string">$&</span>');
    
    // Process other syntax elements
    highlightedLine = highlightedLine.replace(patterns.decorator, '<span class="decorator">$&</span>');
    highlightedLine = highlightedLine.replace(patterns.keyword, '<span class="keyword">$&</span>');
    highlightedLine = highlightedLine.replace(patterns.function, '<span class="function">$&</span>');
    highlightedLine = highlightedLine.replace(patterns.className, '<span class="class-name">$&</span>');
    highlightedLine = highlightedLine.replace(patterns.number, '<span class="number">$&</span>');
    
    // Return the line with line number
    return (
      <span key={index} className="line" dangerouslySetInnerHTML={{ __html: highlightedLine }} />
    );
  });
};

const CodeTemplate: React.FC = () => {
  const { nodes, edges, graphName } = useGraph();
  const [code, setCode] = useState<string>('');

  // Generate template code based on the current graph state
  useEffect(() => {
    // This function will be called whenever the graph changes
    const generateCode = () => {
      // Start with the base template
      let generatedCode = `# Generated LangGraph code for: ${graphName || 'Untitled Graph'}

# Standard imports
import json
import asyncio
from typing import Dict, List, Any, TypedDict, Literal, Union, Annotated, Callable, Optional

# LangGraph imports
from langgraph.graph import StateGraph
from langgraph.prebuilt import ToolNode, AgentNode
from langgraph.checkpoint import Checkpoint

# Define the state schema with flexible structure for all node types
class GraphState(TypedDict):
    input: str
    intermediate_steps: List[Any]
    output: str
    memory: Dict[str, Any]  # For Memory Read/Write nodes
    context: Dict[str, Any]  # For additional context storage
    tool_results: Dict[str, Any]  # For tool outputs

# Initialize the graph
graph = StateGraph(GraphState)

`;

      // Add node definitions based on the current graph
      if (nodes.length > 0) {
        generatedCode += '# Node definitions\n';
        
        // Sort nodes to ensure START nodes come first
        const sortedNodes = [...nodes].sort((a, b) => {
          if (a.type === 'startNode') return -1;
          if (b.type === 'startNode') return 1;
          return 0;
        });
        
        sortedNodes.forEach(node => {
          const nodeId = node.id.replace(/-/g, '_');
          
          switch (node.type) {
            case 'startNode':
              generatedCode += `@graph.node("start")
def ${nodeId}(state: GraphState) -> Dict[str, Any]:
    """${node.data.label || 'Start node'} - Entry point of the graph"""
    # Initialize state if needed
    return {"context": {"status": "Graph execution started"}}

`;
              break;
              
            case 'endNode':
              generatedCode += `@graph.node("end")
def ${nodeId}(state: GraphState) -> Dict[str, Any]:
    """${node.data.label || 'End node'} - Terminal node that marks completion"""
    # Format the final output
    return {"final_output": state.get("output", "No output")}

`;
              break;
              
            case 'llmNode':
              generatedCode += `@graph.node
def ${nodeId}(state: GraphState) -> Dict[str, Any]:
    """${node.data.label || 'LLM Node'} - Language model for text generation"""
    # Implement LLM call here
    # Using model: ${node.data.modelName || 'default_model'}
    return {"output": "Generated text would appear here"}

`;
              break;
              
            case 'toolNode':
              generatedCode += `@graph.node
def ${nodeId}(state: GraphState) -> Dict[str, Any]:
    """${node.data.label || 'Tool Node'} - Executes a specific function"""
    # Implement tool call here
    # Function: ${node.data.functionName || 'function_name'}
    return {"tool_results": {"result": "Tool execution result would appear here"}}

`;
              break;
              
            case 'subgraphNode':
              generatedCode += `@graph.node
def ${nodeId}(state: GraphState) -> Dict[str, Any]:
    """${node.data.label || 'Subgraph Node'} - Encapsulates another graph"""
    # Execute subgraph: ${node.data.graphId || 'graph_id'}
    # This would invoke another LangGraph workflow
    return {"output": "Subgraph execution result would appear here"}

`;
              break;
              
            default:
              generatedCode += `@graph.node
def ${nodeId}(state: GraphState) -> Dict[str, Any]:
    """${node.data.label || node.type} Node"""
    # Implementation for ${node.type}
    return {}

`;
          }
        });
      }

      // Add edge definitions
      if (edges.length > 0) {
        generatedCode += '# Edge definitions\n';
        
        edges.forEach(edge => {
          const sourceId = edge.source.replace(/-/g, '_');
          const targetId = edge.target.replace(/-/g, '_');
          
          if (edge.sourceHandle) {
            generatedCode += `graph.add_conditional_edges(
    ${sourceId},
    lambda state: "${edge.sourceHandle}",
    {
        "${edge.sourceHandle}": ${targetId}
    }
)
`;
          } else {
            generatedCode += `graph.add_edge(${sourceId}, ${targetId})
`;
          }
        });
        
        generatedCode += '\n';
      }

      // Add compilation and execution code
      generatedCode += `# Compile the graph
app = graph.compile()

# Function to run the graph
def run_graph(input_text: str) -> Dict[str, Any]:
    """Run the graph with the given input"""
    result = app.invoke({"input": input_text})
    return result

# Example usage
if __name__ == "__main__":
    result = run_graph("Hello, world!")
    print(f"Result: {result}")
`;

      return generatedCode;
    };

    setCode(generateCode());
  }, [nodes, edges, graphName]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-bold">Code Template</h2>
        <p className="text-sm text-gray-600">
          This code template updates as you build your graph. Copy it to use in your own projects.
        </p>
      </div>
      
      <div className="flex-grow overflow-auto custom-scrollbar border border-gray-200 rounded-md">
        <pre className="p-4 m-0 h-full bg-gray-50 text-sm font-mono whitespace-pre overflow-auto python-code">
          {formatPythonCode(code)}
        </pre>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="px-4 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
};

export default CodeTemplate;
