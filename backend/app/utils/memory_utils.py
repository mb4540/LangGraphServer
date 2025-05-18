"""Memory utility functions for LangGraph Server."""

import json
from typing import Any, Dict, List, Optional, Union
import logging
import time
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In-memory storage for short-term memory
STATE_MEMORY = {}

class MemoryStorage:
    """Base class for memory storage implementations."""
    
    def read(self, key: str, namespace: Optional[str] = None) -> Any:
        """Read a value from memory."""
        raise NotImplementedError()
    
    def write(self, key: str, value: Any, namespace: Optional[str] = None, ttl: Optional[int] = None) -> None:
        """Write a value to memory."""
        raise NotImplementedError()
    
    def delete(self, key: str, namespace: Optional[str] = None) -> None:
        """Delete a value from memory."""
        raise NotImplementedError()

class ShortTermMemory(MemoryStorage):
    """In-memory storage that persists only during graph execution."""
    
    def read(self, key: Optional[str] = None, namespace: Optional[str] = None) -> Any:
        """Read a value from short-term memory.
        
        Args:
            key: The key to read. If None, returns all values in the namespace.
            namespace: Optional namespace to organize memories.
            
        Returns:
            The value associated with the key, or all values in the namespace if key is None.
        """
        ns = namespace or "default"
        
        if ns not in STATE_MEMORY:
            return None
        
        if key is None:
            return STATE_MEMORY.get(ns, {})
        
        return STATE_MEMORY.get(ns, {}).get(key)
    
    def write(self, key: str, value: Any, namespace: Optional[str] = None, 
              ttl: Optional[int] = None, overwrite_existing: bool = True) -> None:
        """Write a value to short-term memory.
        
        Args:
            key: The key to write.
            value: The value to write.
            namespace: Optional namespace to organize memories.
            ttl: Time-to-live in seconds (not used for short-term memory).
            overwrite_existing: Whether to overwrite existing value.
        """
        ns = namespace or "default"
        
        if ns not in STATE_MEMORY:
            STATE_MEMORY[ns] = {}
        
        if key in STATE_MEMORY[ns] and not overwrite_existing:
            # Append to existing data if it's a list or dict
            existing = STATE_MEMORY[ns][key]
            if isinstance(existing, list) and isinstance(value, list):
                STATE_MEMORY[ns][key].extend(value)
            elif isinstance(existing, dict) and isinstance(value, dict):
                STATE_MEMORY[ns][key].update(value)
            elif isinstance(existing, str) and isinstance(value, str):
                STATE_MEMORY[ns][key] += value
            else:
                # For other types, just create an array
                STATE_MEMORY[ns][key] = [existing, value]
        else:
            STATE_MEMORY[ns][key] = value
    
    def delete(self, key: str, namespace: Optional[str] = None) -> None:
        """Delete a value from short-term memory.
        
        Args:
            key: The key to delete.
            namespace: Optional namespace to organize memories.
        """
        ns = namespace or "default"
        
        if ns in STATE_MEMORY and key in STATE_MEMORY[ns]:
            del STATE_MEMORY[ns][key]

class LongTermMemory(MemoryStorage):
    """Persistent storage that persists across graph executions.
    
    This is a simple implementation using a JSON file. In a production environment,
    this would be replaced with a database like Redis, MongoDB, or a vector database.
    """
    
    def __init__(self, storage_path: str = "./long_term_memory.json"):
        """Initialize the long-term memory storage.
        
        Args:
            storage_path: Path to the storage file.
        """
        self.storage_path = storage_path
        self._memory_cache = self._load_memory()
    
    def _load_memory(self) -> Dict[str, Dict[str, Any]]:
        """Load memory from storage file."""
        try:
            with open(self.storage_path, "r") as f:
                data = json.load(f)
                # Clean up expired entries
                self._cleanup_expired(data)
                return data
        except (FileNotFoundError, json.JSONDecodeError):
            return {}
    
    def _save_memory(self) -> None:
        """Save memory to storage file."""
        with open(self.storage_path, "w") as f:
            json.dump(self._memory_cache, f)
    
    def _cleanup_expired(self, data: Dict[str, Dict[str, Any]]) -> None:
        """Remove expired entries from memory."""
        now = time.time()
        for ns in list(data.keys()):
            for key in list(data[ns].keys()):
                if "_expires_at" in data[ns][key] and data[ns][key]["_expires_at"] < now:
                    del data[ns][key]
    
    def read(self, key: Optional[str] = None, namespace: Optional[str] = None) -> Any:
        """Read a value from long-term memory.
        
        Args:
            key: The key to read. If None, returns all values in the namespace.
            namespace: Optional namespace to organize memories.
            
        Returns:
            The value associated with the key, or all values in the namespace if key is None.
        """
        # Refresh memory from storage
        self._memory_cache = self._load_memory()
        
        ns = namespace or "default"
        
        if ns not in self._memory_cache:
            return None
        
        if key is None:
            # Return all values in namespace (except metadata)
            result = {}
            for k, v in self._memory_cache.get(ns, {}).items():
                if isinstance(v, dict) and "_value" in v:
                    result[k] = v["_value"]
                else:
                    result[k] = v
            return result
        
        item = self._memory_cache.get(ns, {}).get(key)
        if isinstance(item, dict) and "_value" in item:
            return item["_value"]
        return item
    
    def write(self, key: str, value: Any, namespace: Optional[str] = None, 
              ttl: Optional[int] = None, overwrite_existing: bool = True) -> None:
        """Write a value to long-term memory.
        
        Args:
            key: The key to write.
            value: The value to write.
            namespace: Optional namespace to organize memories.
            ttl: Time-to-live in seconds.
            overwrite_existing: Whether to overwrite existing value.
        """
        # Refresh memory from storage
        self._memory_cache = self._load_memory()
        
        ns = namespace or "default"
        
        if ns not in self._memory_cache:
            self._memory_cache[ns] = {}
        
        # Prepare the value with metadata
        memory_item = {
            "_value": value,
            "_created_at": time.time()
        }
        
        if ttl is not None:
            memory_item["_expires_at"] = time.time() + ttl
        
        if key in self._memory_cache[ns] and not overwrite_existing:
            # Append to existing data if it's a list or dict
            existing = self._memory_cache[ns][key]
            if isinstance(existing, dict) and "_value" in existing:
                existing_value = existing["_value"]
                if isinstance(existing_value, list) and isinstance(value, list):
                    memory_item["_value"] = existing_value + value
                elif isinstance(existing_value, dict) and isinstance(value, dict):
                    existing_value.update(value)
                    memory_item["_value"] = existing_value
                elif isinstance(existing_value, str) and isinstance(value, str):
                    memory_item["_value"] = existing_value + value
                else:
                    memory_item["_value"] = [existing_value, value]
            else:
                # Unknown format, just overwrite
                pass
        
        self._memory_cache[ns][key] = memory_item
        self._save_memory()
    
    def delete(self, key: str, namespace: Optional[str] = None) -> None:
        """Delete a value from long-term memory.
        
        Args:
            key: The key to delete.
            namespace: Optional namespace to organize memories.
        """
        # Refresh memory from storage
        self._memory_cache = self._load_memory()
        
        ns = namespace or "default"
        
        if ns in self._memory_cache and key in self._memory_cache[ns]:
            del self._memory_cache[ns][key]
            self._save_memory()

# Global memory instances
short_term_memory = ShortTermMemory()
long_term_memory = LongTermMemory()

def get_memory_by_type(memory_type: str) -> MemoryStorage:
    """Get memory storage by type.
    
    Args:
        memory_type: Either 'short_term' or 'long_term'.
        
    Returns:
        The appropriate memory storage instance.
    """
    if memory_type == "short_term":
        return short_term_memory
    elif memory_type == "long_term":
        return long_term_memory
    else:
        raise ValueError(f"Unknown memory type: {memory_type}")

# Memory read/write utility functions for templates
def read_memory(memory_type: str, key: Optional[str] = None, namespace: Optional[str] = None, 
               filter_expr: Optional[str] = None) -> Any:
    """Read from memory with optional filtering.
    
    Args:
        memory_type: Either 'short_term' or 'long_term'.
        key: The key to read. If None, returns all values in the namespace.
        namespace: Optional namespace to organize memories.
        filter_expr: Optional Python expression to filter memories.
        
    Returns:
        The memory data, optionally filtered.
    """
    memory = get_memory_by_type(memory_type)
    data = memory.read(key, namespace)
    
    if filter_expr and data is not None:
        try:
            # Use filter expression to filter the data
            # The filter expression should be a Python expression that returns a boolean
            # and has access to the 'memory' variable
            memory_var = data
            result = eval(filter_expr, {"memory": memory_var})
            return result
        except Exception as e:
            logger.error(f"Error evaluating filter expression: {e}")
            # Return unfiltered data on error
            return data
    
    return data

def write_memory(memory_type: str, key: str, value: Any, namespace: Optional[str] = None,
                ttl: Optional[int] = None, overwrite_existing: bool = True) -> None:
    """Write to memory.
    
    Args:
        memory_type: Either 'short_term' or 'long_term'.
        key: The key to write.
        value: The value to write.
        namespace: Optional namespace to organize memories.
        ttl: Time-to-live in seconds.
        overwrite_existing: Whether to overwrite existing value.
    """
    memory = get_memory_by_type(memory_type)
    memory.write(key, value, namespace, ttl, overwrite_existing)
