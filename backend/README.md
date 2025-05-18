# LangGraph Server Backend

This is the Python FastAPI backend for the LangGraph Server application. It provides an API endpoint to generate Python code from LangGraph visual workflows.

## Features

- `/api/generate_code` endpoint that converts graph JSON into Python code using Jinja2 templates
- Validation of graph schema using Pydantic models
- Automated code syntax checking via Python's py_compile module

## Setup & Installation

### Using Python Directly

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the server:
   ```bash
   python run.py
   ```

### Using Docker

1. Build the Docker image:
   ```bash
   docker build -t langgraph-server-backend .
   ```

2. Run the container:
   ```bash
   docker run -p 8000:8000 langgraph-server-backend
   ```

## Testing

Run the tests using pytest:

```bash
pytest tests/
```

## API Documentation

Once the server is running, you can access the auto-generated Swagger documentation at:

- http://localhost:8000/docs

## Usage

To generate code from a graph, send a POST request to `/api/generate_code` with a JSON payload conforming to the GraphSchema model.

Example:

```bash
curl -X POST http://localhost:8000/api/generate_code \
  -H "Content-Type: application/json" \
  -d '{"nodes":[...], "edges":[...], "graphName":"My Workflow"}'
```

The response will contain the generated Python code and the path to a temporary file where the code was saved.
