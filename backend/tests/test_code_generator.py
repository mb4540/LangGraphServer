import os
import json
import pytest
import tempfile
import subprocess
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

# Sample valid graph data for testing
VALID_GRAPH_DATA = {
    "nodes": [
        {
            "id": "llmNode-1",
            "type": "llmNode",
            "position": {"x": 250, "y": 100},
            "data": {
                "label": "Query Processor",
                "model": "gpt-4",
                "temperature": 0.7
            }
        },
        {
            "id": "toolNode-1",
            "type": "toolNode",
            "position": {"x": 250, "y": 250},
            "data": {
                "label": "Web Search",
                "modulePath": "web_search",
                "functionName": "search"
            }
        },
        {
            "id": "endNode-1",
            "type": "endNode",
            "position": {"x": 250, "y": 400},
            "data": {
                "label": "Final Response",
                "outputFormat": "text"
            }
        }
    ],
    "edges": [
        {
            "id": "e1-2",
            "source": "llmNode-1",
            "target": "toolNode-1",
            "animated": True
        },
        {
            "id": "e2-3",
            "source": "toolNode-1",
            "target": "endNode-1",
            "animated": True
        }
    ],
    "graphName": "Test Workflow"
}


def test_generate_code_endpoint():
    """Test that the /generate_code endpoint correctly generates Python code."""
    response = client.post("/api/generate_code", json=VALID_GRAPH_DATA)
    
    # Check that the request was successful
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}: {response.text}"
    
    # Check that the response contains the expected fields
    response_data = response.json()
    assert "file_path" in response_data, "Response does not contain file_path"
    assert "code" in response_data, "Response does not contain code"
    
    # Verify that the generated file exists
    file_path = response_data["file_path"]
    assert os.path.exists(file_path), f"Generated file {file_path} does not exist"
    
    # Check that the code contains expected elements
    code = response_data["code"]
    assert "from langgraph.graph import StateGraph" in code, "Generated code missing LangGraph import"
    assert "# Generated LangGraph code for: Test Workflow" in code, "Generated code missing graph name comment"
    assert "@graph.node" in code, "Generated code missing @graph.node decorators"
    
    # Verify that the code compiles
    try:
        # Write code to a temporary file
        with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode="w") as tmp_file:
            tmp_file.write(code)
            test_file_path = tmp_file.name
        
        # Check if the code compiles
        result = subprocess.run(
            ["python", "-m", "py_compile", test_file_path],
            capture_output=True,
            text=True,
            check=False
        )
        
        assert result.returncode == 0, f"Code compilation failed: {result.stderr}"
    finally:
        # Clean up
        if os.path.exists(test_file_path):
            os.unlink(test_file_path)
        if os.path.exists(file_path):
            os.unlink(file_path)


def test_invalid_graph_data():
    """Test that the endpoint properly handles invalid graph data."""
    # Test with missing required fields
    invalid_data = {
        "nodes": [],
        # Missing edges and graphName
    }
    
    response = client.post("/api/generate_code", json=invalid_data)
    
    # Should return a 422 Unprocessable Entity
    assert response.status_code == 422, f"Expected status code 422, got {response.status_code}"
