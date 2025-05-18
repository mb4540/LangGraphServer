"""Default tools that can be used by Agent nodes in LangGraph"""

import json
import datetime
from typing import Optional, List, Dict, Any

def search_web(query: str) -> str:
    """Search the web for information about a given query.
    
    Args:
        query: The search query string
        
    Returns:
        A string containing search results
    """
    # In a production environment, this would connect to a real search API
    # This is a placeholder implementation
    return f"Found results for: {query}\n1. Example result 1\n2. Example result 2\n3. Example result 3"

def calculate(expression: str) -> str:
    """Evaluate a mathematical expression.
    
    Args:
        expression: A string containing a mathematical expression
        
    Returns:
        The result of the calculation as a string
    """
    try:
        # Warning: eval can be dangerous in production; this is for demonstration
        # In production, use a safer math parser
        result = eval(expression, {"__builtins__": {}}, {})
        return f"Result: {result}"
    except Exception as e:
        return f"Error evaluating expression: {str(e)}"

def get_current_weather(location: str, unit: str = "celsius") -> str:
    """Get the current weather for a location.
    
    Args:
        location: City or location name
        unit: Temperature unit (celsius or fahrenheit)
        
    Returns:
        Weather information as a string
    """
    # This would connect to a weather API in production
    # Placeholder implementation
    return f"Weather in {location}: 22°{unit[0].upper()}, Partly Cloudy"

def read_file(file_path: str) -> str:
    """Read the contents of a file.
    
    Args:
        file_path: Path to the file to read
        
    Returns:
        The contents of the file as a string
    """
    try:
        with open(file_path, 'r') as f:
            return f.read()
    except Exception as e:
        return f"Error reading file: {str(e)}"

def write_file(file_path: str, content: str) -> str:
    """Write content to a file.
    
    Args:
        file_path: Path to the file to write
        content: Content to write to the file
        
    Returns:
        A success or error message
    """
    try:
        with open(file_path, 'w') as f:
            f.write(content)
        return f"Successfully wrote to {file_path}"
    except Exception as e:
        return f"Error writing to file: {str(e)}"

def get_current_datetime() -> str:
    """Get the current date and time.
    
    Returns:
        The current date and time as a formatted string
    """
    now = datetime.datetime.now()
    return f"Current date and time: {now.strftime('%Y-%m-%d %H:%M:%S')}"

def json_parser(text: str) -> Dict[str, Any]:
    """Parse JSON from text.
    
    Args:
        text: Text containing JSON data
        
    Returns:
        Parsed JSON as a dictionary
    """
    try:
        # Extract JSON from text if it's embedded in other content
        # Look for content between curly braces
        start_idx = text.find('{')
        end_idx = text.rfind('}')
        
        if start_idx != -1 and end_idx != -1:
            json_str = text[start_idx:end_idx+1]
            return json.loads(json_str)
        else:
            # Try to parse the entire text as JSON
            return json.loads(text)
    except json.JSONDecodeError as e:
        return {"error": f"Failed to parse JSON: {str(e)}"}

def summarize_text(text: str, max_length: int = 100) -> str:
    """Summarize a long text to a shorter version.
    
    Args:
        text: The text to summarize
        max_length: Maximum length of the summary
        
    Returns:
        A summarized version of the text
    """
    # In production, this would use an LLM or summarization algorithm
    # Simple placeholder implementation
    if len(text) <= max_length:
        return text
    
    # Simple truncation with ellipsis
    return text[:max_length-3] + "..."
