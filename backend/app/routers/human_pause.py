"""API routes for managing human interventions in workflows"""

from fastapi import APIRouter, HTTPException, Body
from typing import Dict, List, Optional, Any

from ..utils.human_pause_utils import HumanPauseManager

router = APIRouter(prefix="/api/human-intervention", tags=["human-intervention"])


@router.get("/pending")
async def get_pending_interventions() -> List[Dict[str, Any]]:
    """Get all pending human intervention requests
    
    Returns:
        List of pending intervention requests
    """
    return HumanPauseManager.get_pending_requests()


@router.get("/{request_id}")
async def get_intervention(request_id: str) -> Dict[str, Any]:
    """Get a specific intervention request
    
    Args:
        request_id: ID of the request to retrieve
    
    Returns:
        Request information
    
    Raises:
        HTTPException: If the request is not found
    """
    request = HumanPauseManager.get_request(request_id)
    if request is None:
        raise HTTPException(status_code=404, detail="Intervention request not found")
    return request


@router.post("/{request_id}/resume")
async def resume_intervention(
    request_id: str,
    data: Dict[str, Any] = Body(...),
    skip: bool = False
) -> Dict[str, str]:
    """Resume execution of a paused workflow
    
    Args:
        request_id: ID of the request to resume
        data: Response data (updated state)
        skip: If True, skip this intervention point
    
    Returns:
        Success message
    
    Raises:
        HTTPException: If the request cannot be resumed
    """
    success = HumanPauseManager.resume_execution(request_id, data, skip)
    if not success:
        raise HTTPException(status_code=400, detail="Cannot resume intervention")
    return {"status": "success", "message": "Workflow resumed"}
