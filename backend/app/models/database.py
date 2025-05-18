from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship, create_engine, Session
import os

# Get database URL from environment variable or use a default
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@db:5432/langgraph")

# Create SQLModel classes
class Base(SQLModel):
    """Base model with common fields"""
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class Project(SQLModel, table=True):
    """Project model to organize graph versions"""
    __tablename__ = "projects"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    is_deleted: bool = Field(default=False, nullable=False)
    
    # Relationship to graph versions
    versions: List["GraphVersion"] = Relationship(back_populates="project")


class GraphVersion(SQLModel, table=True):
    """Version model to store graph history"""
    __tablename__ = "graph_versions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="projects.id", index=True)
    version_tag: str = Field(default="main", index=True)  # Git-like version tag
    graph_json: str  # Stored as JSON string
    rendered_code: str  # The generated Python code
    is_draft: bool = Field(default=False, nullable=False)  # Flag for draft versions
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    
    # Relationship to project
    project: Project = Relationship(back_populates="versions")


# Database initialization
def get_engine():
    """Create and return a SQLAlchemy engine"""
    return create_engine(DATABASE_URL)


def get_session():
    """Get a new database session"""
    engine = get_engine()
    with Session(engine) as session:
        yield session


def init_db():
    """Initialize the database with tables"""
    engine = get_engine()
    SQLModel.metadata.create_all(engine)
