from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.routers import code_generator, websockets, projects
from app.models.database import init_db

app = FastAPI(
    title="LangGraph Server",
    description="An API for generating and managing LangGraph workflows",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify the actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(code_generator.router, prefix="/api")
app.include_router(websockets.router, prefix="/api")
app.include_router(projects.router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    # Initialize the database
    init_db()


@app.get("/")
async def root():
    return {"message": "Welcome to LangGraph Server API"}
