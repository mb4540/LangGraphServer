from fastapi.testclient import TestClient
from ..main import app # Use relative import from the 'main' module in the parent directory

client = TestClient(app)


def def_test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello from LangGraph Workflow Builder Backend"}
