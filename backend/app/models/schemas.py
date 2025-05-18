from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

# Project schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Graph version schemas
class GraphData(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    graphName: str


class GraphVersionBase(BaseModel):
    version_tag: str = "main"  # Default to main branch
    graph_json: str
    rendered_code: str


class GraphVersionCreate(GraphVersionBase):
    is_draft: bool = False


class GraphVersionUpdate(BaseModel):
    version_tag: Optional[str] = None
    graph_json: Optional[str] = None
    rendered_code: Optional[str] = None
    is_draft: Optional[bool] = None


class GraphVersionResponse(GraphVersionBase):
    id: int
    project_id: int
    is_draft: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
