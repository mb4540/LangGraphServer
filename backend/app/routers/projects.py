import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session, select
from datetime import datetime

from app.models.database import Project, GraphVersion, get_session
from app.models.schemas import (
    ProjectCreate, ProjectResponse, ProjectUpdate,
    GraphVersionCreate, GraphVersionResponse, GraphVersionUpdate, GraphData
)
from app.routers.code_generator import generate_python_code

router = APIRouter(tags=["projects"])


# Project endpoints
@router.post("/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, session: Session = Depends(get_session)):
    """Create a new project"""
    db_project = Project(**project.dict())
    session.add(db_project)
    session.commit()
    session.refresh(db_project)
    return db_project


@router.get("/projects", response_model=List[ProjectResponse])
async def get_projects(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    """Get all projects"""
    query = select(Project).where(Project.is_deleted == False).offset(skip).limit(limit)
    projects = session.exec(query).all()
    return projects


@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int, session: Session = Depends(get_session)):
    """Get a specific project by ID"""
    project = session.get(Project, project_id)
    if not project or project.is_deleted:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: int, project_update: ProjectUpdate, session: Session = Depends(get_session)):
    """Update a project"""
    db_project = session.get(Project, project_id)
    if not db_project or db_project.is_deleted:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)
    
    db_project.updated_at = datetime.utcnow()
    session.add(db_project)
    session.commit()
    session.refresh(db_project)
    return db_project


@router.delete("/projects/{project_id}", response_model=ProjectResponse)
async def delete_project(project_id: int, session: Session = Depends(get_session)):
    """Soft delete a project"""
    db_project = session.get(Project, project_id)
    if not db_project or db_project.is_deleted:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_project.is_deleted = True
    db_project.updated_at = datetime.utcnow()
    session.add(db_project)
    session.commit()
    session.refresh(db_project)
    return db_project


# Graph version endpoints
@router.post("/projects/{project_id}/versions", response_model=GraphVersionResponse)
async def create_graph_version(
    project_id: int, 
    graph_data: GraphData = Body(...),
    version_tag: Optional[str] = "main",
    session: Session = Depends(get_session)
):
    """Create a new graph version for a project"""
    # Check if project exists
    project = session.get(Project, project_id)
    if not project or project.is_deleted:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Generate code from graph data
    try:
        code_result = await generate_python_code(graph_data)
        rendered_code = code_result.get("code", "")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to generate code: {str(e)}")
    
    # Create a new graph version
    graph_version = GraphVersion(
        project_id=project_id,
        version_tag=version_tag,
        graph_json=json.dumps(graph_data.dict()),
        rendered_code=rendered_code
    )
    
    session.add(graph_version)
    session.commit()
    session.refresh(graph_version)
    return graph_version


@router.get("/projects/{project_id}/versions", response_model=List[GraphVersionResponse])
async def get_project_versions(
    project_id: int, 
    skip: int = 0, 
    limit: int = 100, 
    session: Session = Depends(get_session)
):
    """Get all graph versions for a project"""
    # Check if project exists
    project = session.get(Project, project_id)
    if not project or project.is_deleted:
        raise HTTPException(status_code=404, detail="Project not found")
    
    query = (
        select(GraphVersion)
        .where(GraphVersion.project_id == project_id)
        .order_by(GraphVersion.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    versions = session.exec(query).all()
    return versions


@router.get("/projects/{project_id}/versions/{version_id}", response_model=GraphVersionResponse)
async def get_graph_version(project_id: int, version_id: int, session: Session = Depends(get_session)):
    """Get a specific graph version"""
    # Check if project exists
    project = session.get(Project, project_id)
    if not project or project.is_deleted:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get the version
    version = session.get(GraphVersion, version_id)
    if not version or version.project_id != project_id:
        raise HTTPException(status_code=404, detail="Graph version not found")
    
    return version


@router.put("/projects/{project_id}/graph", response_model=GraphVersionResponse)
async def update_draft_graph(
    project_id: int, 
    graph_data: GraphData = Body(...),
    session: Session = Depends(get_session)
):
    """Update the latest draft graph without creating a new version"""
    # Check if project exists
    project = session.get(Project, project_id)
    if not project or project.is_deleted:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Find the latest draft version
    query = (
        select(GraphVersion)
        .where(GraphVersion.project_id == project_id)
        .where(GraphVersion.is_draft == True)
        .order_by(GraphVersion.created_at.desc())
    )
    draft_version = session.exec(query).first()
    
    # Generate code from graph data
    try:
        code_result = await generate_python_code(graph_data)
        rendered_code = code_result.get("code", "")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to generate code: {str(e)}")
    
    if draft_version:
        # Update existing draft
        draft_version.graph_json = json.dumps(graph_data.dict())
        draft_version.rendered_code = rendered_code
        draft_version.updated_at = datetime.utcnow()
        session.add(draft_version)
        session.commit()
        session.refresh(draft_version)
        return draft_version
    else:
        # Create a new draft if none exists
        new_draft = GraphVersion(
            project_id=project_id,
            version_tag="draft",
            graph_json=json.dumps(graph_data.dict()),
            rendered_code=rendered_code,
            is_draft=True
        )
        session.add(new_draft)
        session.commit()
        session.refresh(new_draft)
        return new_draft
