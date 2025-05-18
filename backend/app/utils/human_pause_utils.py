"""Human intervention utilities for workflow pausing and resuming in LangGraph Server"""

import asyncio
import logging
import time
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Union

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In-memory store for paused executions
# This would be replaced with a database in a production environment
_paused_executions = {}


class HumanInterventionRequest:
    """Represents a request for human intervention in a workflow"""
    
    def __init__(self, 
                 message: str,
                 state: Dict[str, Any],
                 required_fields: Optional[List[str]] = None,
                 allow_edits: bool = True,
                 timeout_ms: Optional[int] = None):
        """Initialize the intervention request
        
        Args:
            message: Message to display to the human
            state: Current workflow state
            required_fields: Fields that must be provided by the human
            allow_edits: Whether state edits are allowed
            timeout_ms: Optional timeout in milliseconds
        """
        self.id = str(uuid.uuid4())
        self.message = message
        self.state = state
        self.required_fields = required_fields or []
        self.allow_edits = allow_edits
        self.timeout_ms = timeout_ms
        self.created_at = datetime.now()
        self.response = None
        self.completed = False
        self.timed_out = False
        self.future = asyncio.Future()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation"""
        return {
            "id": self.id,
            "message": self.message,
            "state": self.state,
            "required_fields": self.required_fields,
            "allow_edits": self.allow_edits,
            "created_at": self.created_at.isoformat(),
            "completed": self.completed,
            "timed_out": self.timed_out
        }


class HumanPauseManager:
    """Manager for human intervention in workflows"""
    
    @staticmethod
    def request_intervention(message: str, 
                           state: Dict[str, Any],
                           required_fields: Optional[List[str]] = None,
                           allow_edits: bool = True,
                           timeout_ms: Optional[int] = None) -> Dict[str, Any]:
        """Create a new intervention request and wait for response
        
        Args:
            message: Message to display to the human
            state: Current workflow state
            required_fields: Fields that must be provided by the human
            allow_edits: Whether state edits are allowed
            timeout_ms: Optional timeout in milliseconds
            
        Returns:
            Updated state (may be edited by human if allow_edits=True)
            
        Raises:
            TimeoutError: If the request times out
        """
        # Create intervention request
        request = HumanInterventionRequest(
            message=message,
            state=state,
            required_fields=required_fields,
            allow_edits=allow_edits,
            timeout_ms=timeout_ms
        )
        
        # Store request for access by API
        _paused_executions[request.id] = request
        
        try:
            # Set up timeout if specified
            if timeout_ms is not None:
                # Convert ms to seconds for asyncio
                timeout_sec = timeout_ms / 1000.0
                # Wait for future with timeout
                try:
                    # Use asyncio to wait with timeout (we run this synchronously)
                    asyncio.get_event_loop().run_until_complete(
                        asyncio.wait_for(request.future, timeout=timeout_sec)
                    )
                except asyncio.TimeoutError:
                    # Mark as timed out and continue with original state
                    request.timed_out = True
                    logger.info(f"Human intervention request {request.id} timed out after {timeout_ms}ms")
                    return state
            else:
                # Wait indefinitely
                asyncio.get_event_loop().run_until_complete(request.future)
            
            # If we get here, the request was completed (not timed out)
            return request.response if request.response is not None else state
        
        finally:
            # Clean up - remove from store after a delay (to allow status checks)
            # In a production system, these would be persisted in a database
            def cleanup():
                if request.id in _paused_executions:
                    del _paused_executions[request.id]
            
            # Schedule cleanup after 5 minutes
            loop = asyncio.get_event_loop()
            loop.call_later(300, cleanup)
    
    @staticmethod
    def get_pending_requests() -> List[Dict[str, Any]]:
        """Get all pending intervention requests
        
        Returns:
            List of pending intervention requests
        """
        return [req.to_dict() for req in _paused_executions.values() 
                if not req.completed and not req.timed_out]
    
    @staticmethod
    def get_request(request_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific intervention request
        
        Args:
            request_id: ID of the request to retrieve
            
        Returns:
            Request information or None if not found
        """
        if request_id in _paused_executions:
            return _paused_executions[request_id].to_dict()
        return None
    
    @staticmethod
    def resume_execution(request_id: str, 
                        response: Dict[str, Any],
                        skip: bool = False) -> bool:
        """Resume execution of a paused workflow
        
        Args:
            request_id: ID of the request to resume
            response: Response data (updated state)
            skip: If True, skip this intervention point
            
        Returns:
            True if successful, False otherwise
        """
        if request_id not in _paused_executions:
            return False
        
        request = _paused_executions[request_id]
        
        # Check if request is still pending
        if request.completed or request.timed_out:
            return False
        
        # If skipping, use original state
        if skip:
            request.response = request.state
        else:
            # Validate required fields if specified
            if request.required_fields and not skip:
                for field in request.required_fields:
                    if field not in response:
                        return False
            
            # Only update state if edits are allowed
            if request.allow_edits:
                request.response = response
            else:
                # If edits not allowed, just mark as responded but keep original state
                request.response = request.state
        
        # Mark as completed and resolve future
        request.completed = True
        request.future.set_result(True)
        
        return True


# Function to be used by the human pause node
def human_pause(state: Dict[str, Any],
               pause_message: str,
               required_fields: Optional[List[str]] = None,
               allow_edits: bool = True,
               timeout_ms: Optional[int] = None) -> Dict[str, Any]:
    """Pause workflow for human intervention
    
    Args:
        state: Current workflow state
        pause_message: Message to display to the human
        required_fields: Fields that must be provided by the human
        allow_edits: Whether to allow state modification
        timeout_ms: Optional timeout in milliseconds
        
    Returns:
        Updated state from human intervention or original state on timeout/skip
    """
    return HumanPauseManager.request_intervention(
        message=pause_message,
        state=state,
        required_fields=required_fields,
        allow_edits=allow_edits,
        timeout_ms=timeout_ms
    )
