"""Utility functions for tool management in LangGraph Server"""

from typing import Dict, List, Callable, Any, Optional
import importlib
import inspect

def get_tool_by_name(tool_name: str, module_path: Optional[str] = None) -> Callable:
    """Dynamically imports and returns a tool function by name.
    
    Args:
        tool_name: The name of the tool function to import
        module_path: Optional module path where the tool is defined
        
    Returns:
        The imported tool function
        
    Raises:
        ImportError: If the module or tool cannot be imported
        AttributeError: If the tool function doesn't exist in the module
    """
    if not module_path:
        # Use a default tools module if none provided
        module_path = "app.tools.default_tools"
    
    try:
        module = importlib.import_module(module_path)
        if not hasattr(module, tool_name):
            raise AttributeError(f"Tool '{tool_name}' not found in module '{module_path}'")
        return getattr(module, tool_name)
    except (ImportError, AttributeError) as e:
        # Log the error and raise
        print(f"Error importing tool {tool_name} from {module_path}: {str(e)}")
        raise

def collect_available_tools(tool_names: List[str], module_paths: Optional[Dict[str, str]] = None) -> Dict[str, Dict[str, Any]]:
    """Collects and returns a dictionary of tools that can be used by an agent.
    
    Args:
        tool_names: List of tool names to collect
        module_paths: Optional mapping of tool names to their module paths
        
    Returns:
        A dictionary mapping tool names to their function and metadata
    """
    tools = {}
    module_paths = module_paths or {}
    
    for tool_name in tool_names:
        module_path = module_paths.get(tool_name)
        
        try:
            tool_fn = get_tool_by_name(tool_name, module_path)
            
            # Get the tool description from docstring
            doc = inspect.getdoc(tool_fn) or f"Tool: {tool_name}"
            
            # Add the tool to our collection
            tools[tool_name] = {
                "func": tool_fn,
                "description": doc.split('\n')[0],  # Use first line of docstring
                "module_path": module_path
            }
            
        except (ImportError, AttributeError) as e:
            # Create a placeholder for tools that couldn't be imported
            tools[tool_name] = {
                "func": lambda x: f"Error: Tool '{tool_name}' not available. {str(e)}",
                "description": f"[PLACEHOLDER] Tool: {tool_name}",
                "is_placeholder": True
            }
    
    return tools

def get_tools_for_agent() -> Dict[str, Dict[str, Any]]:
    """Returns a dictionary of all available tools for use in agents.
    This is a convenience function that can be called from generated code.
    
    Returns:
        A dictionary mapping tool names to their function and metadata
    """
    # This would be expanded to dynamically discover tools from various modules
    # For now, we'll include a few example tools
    default_tools = [
        "search_web",
        "calculate",
        "get_current_weather",
        "read_file",
        "write_file"
    ]
    
    # You could have a mapping of tool names to module paths
    # This would be populated from a database or configuration file
    module_paths = {
        "search_web": "app.tools.web_tools",
        "calculate": "app.tools.math_tools",
        "get_current_weather": "app.tools.weather_tools",
        "read_file": "app.tools.file_tools",
        "write_file": "app.tools.file_tools"
    }
    
    return collect_available_tools(default_tools, module_paths)
