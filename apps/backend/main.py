from fastapi import FastAPI

app = FastAPI(
    title="LangGraph Workflow Builder Backend",
    version="0.1.0",
)

@app.get("/")
async def read_root():
    return {"message": "Hello from LangGraph Workflow Builder Backend"}


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
