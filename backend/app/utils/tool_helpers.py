"""Helper utilities for tool management in LangGraph Server"""

import time
import asyncio
import inspect
import logging
from typing import Any, Callable, Dict, List, Optional, Union, Type
from concurrent.futures import ThreadPoolExecutor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Error handling strategies
class ErrorStrategy:
    FAIL = "fail"    # Propagate errors (default)
    IGNORE = "ignore"  # Continue execution despite errors
    RETRY = "retry"   # Retry the operation

class ToolExecutionError(Exception):
    """Exception raised when a tool execution fails"""
    def __init__(self, tool_name: str, original_error: Exception, attempts: int = 1):
        self.tool_name = tool_name
        self.original_error = original_error
        self.attempts = attempts
        super().__init__(f"Error executing tool '{tool_name}' after {attempts} attempts: {str(original_error)}")

async def execute_with_timeout(func: Callable, args: Any, timeout: Optional[int] = None) -> Any:
    """Execute a function with a timeout.
    
    Args:
        func: The function to execute
        args: Arguments to pass to the function
        timeout: Timeout in milliseconds
        
    Returns:
        The result of the function
        
    Raises:
        TimeoutError: If the function execution times out
        Exception: Any exception raised by the function
    """
    # Convert ms to seconds for asyncio
    timeout_sec = timeout / 1000 if timeout else None
    
    # Create a coroutine that runs the function in a thread pool
    loop = asyncio.get_event_loop()
    
    try:
        if timeout_sec:
            return await asyncio.wait_for(
                loop.run_in_executor(None, lambda: func(args)),
                timeout=timeout_sec
            )
        else:
            return await loop.run_in_executor(None, lambda: func(args))
    except asyncio.TimeoutError:
        raise TimeoutError(f"Tool execution timed out after {timeout}ms")

async def execute_with_retry(func: Callable, args: Any, max_retries: int = 3, 
                        base_delay: float = 1.0, timeout: Optional[int] = None) -> Any:
    """Execute a function with retry logic.
    
    Args:
        func: The function to execute
        args: Arguments to pass to the function
        max_retries: Maximum number of retry attempts
        base_delay: Base delay between retries in seconds
        timeout: Timeout in milliseconds for each attempt
        
    Returns:
        The result of the function
        
    Raises:
        ToolExecutionError: If all retry attempts fail
    """
    func_name = getattr(func, "__name__", str(func))
    last_error = None
    
    for attempt in range(max_retries + 1):
        try:
            # Use execute_with_timeout if timeout is specified
            if timeout:
                return await execute_with_timeout(func, args, timeout)
            else:
                return func(args)
        except Exception as e:
            last_error = e
            logger.warning(f"Attempt {attempt + 1}/{max_retries + 1} failed for tool '{func_name}': {str(e)}")
            
            if attempt < max_retries:
                # Exponential backoff with jitter
                delay = base_delay * (2 ** attempt) * (0.5 + 0.5 * (id(func) % 100) / 100.0)
                logger.info(f"Retrying in {delay:.2f} seconds...")
                await asyncio.sleep(delay)
            else:
                break
    
    # If we get here, all attempts failed
    raise ToolExecutionError(func_name, last_error, max_retries + 1)

class ToolExecutor:
    """Executor for tool functions with concurrency and error handling."""
    
    def __init__(self, func: Callable, concurrency: int = 1, 
                 error_handling: str = ErrorStrategy.FAIL,
                 max_retries: int = 3, timeout: Optional[int] = None):
        """Initialize the tool executor.
        
        Args:
            func: The function to execute
            concurrency: Maximum number of concurrent executions
            error_handling: Error handling strategy (fail, ignore, retry)
            max_retries: Maximum number of retry attempts
            timeout: Timeout in milliseconds
        """
        self.func = func
        self.concurrency = max(1, concurrency)
        self.error_handling = error_handling
        self.max_retries = max_retries
        self.timeout = timeout
        self.executor = ThreadPoolExecutor(max_workers=self.concurrency)
        
        # Try to get the function signature for better error messages
        try:
            self.signature = inspect.signature(func)
            self.has_signature = True
        except:
            self.has_signature = False
    
    async def execute(self, args: Any) -> Any:
        """Execute the tool function with error handling and timeout.
        
        Args:
            args: Arguments to pass to the function
            
        Returns:
            The result of the function or an error message
        """
        try:
            # Handle according to error strategy
            if self.error_handling == ErrorStrategy.RETRY:
                return await execute_with_retry(
                    self.func, args, self.max_retries, 1.0, self.timeout
                )
            elif self.timeout:
                return await execute_with_timeout(self.func, args, self.timeout)
            else:
                return self.func(args)
        except Exception as e:
            if self.error_handling == ErrorStrategy.IGNORE:
                # Return a message but don't propagate the error
                return f"Tool execution error (ignored): {str(e)}"
            else:
                # Propagate the error (default behavior)
                raise
    
    async def __call__(self, args: Any) -> Any:
        """Call the executor with the given arguments.
        
        Args:
            args: Arguments to pass to the function
            
        Returns:
            The result of the function
        """
        return await self.execute(args)

def create_tool_executor(func: Callable, **kwargs) -> ToolExecutor:
    """Create a tool executor for a function.
    
    Args:
        func: The function to execute
        **kwargs: Additional arguments for the executor
        
    Returns:
        A configured ToolExecutor
    """
    return ToolExecutor(func, **kwargs)
