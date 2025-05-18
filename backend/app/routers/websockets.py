import json
import aiohttp
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Request
from fastapi.responses import JSONResponse
import os

router = APIRouter(tags=["websockets"])

# Get LangGraph server URL from environment variable or use default
LANGGRAPH_SERVER_URL = os.environ.get("LANGGRAPH_SERVER_URL", "http://localhost:8000")


@router.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket, run_id: str):
    """
    WebSocket proxy that forwards messages between the frontend and LangGraph server.
    """
    await websocket.accept()
    
    # Create a WebSocket connection to the LangGraph server
    try:
        async with aiohttp.ClientSession() as session:
            # Connect to LangGraph server WebSocket
            langgraph_ws_url = f"{LANGGRAPH_SERVER_URL.replace('http', 'ws')}/chat?run_id={run_id}"
            
            async with session.ws_connect(langgraph_ws_url) as langgraph_ws:
                # Create two tasks: one to forward messages from frontend to LangGraph
                # and another to forward messages from LangGraph to frontend
                
                async def forward_to_langgraph():
                    try:
                        while True:
                            # Receive message from frontend
                            data = await websocket.receive_text()
                            # Forward to LangGraph server
                            await langgraph_ws.send_str(data)
                    except WebSocketDisconnect:
                        # Client disconnected
                        await langgraph_ws.close()
                    except Exception as e:
                        print(f"Error forwarding to LangGraph: {e}")
                        await websocket.send_json({"type": "error", "error": str(e)})
                
                async def forward_to_frontend():
                    try:
                        async for msg in langgraph_ws:
                            if msg.type == aiohttp.WSMsgType.TEXT:
                                # Forward message from LangGraph to frontend
                                await websocket.send_text(msg.data)
                            elif msg.type == aiohttp.WSMsgType.ERROR:
                                print(f"LangGraph WebSocket error: {msg.data}")
                                await websocket.send_json({
                                    "type": "error", 
                                    "error": "LangGraph server connection error"
                                })
                                break
                    except Exception as e:
                        print(f"Error forwarding to frontend: {e}")
                        await websocket.send_json({"type": "error", "error": str(e)})
                
                # Run both tasks concurrently
                await asyncio.gather(
                    forward_to_langgraph(),
                    forward_to_frontend(),
                    return_exceptions=True
                )
    
    except Exception as e:
        print(f"WebSocket connection error: {e}")
        await websocket.send_json({"type": "error", "error": f"Could not connect to LangGraph server: {str(e)}"})
    
    finally:
        # Make sure the WebSocket is closed
        if websocket.client_state.CONNECTED:
            await websocket.close()


@router.post("/compile")
async def compile_code(request: Request):
    """
    Proxy endpoint to compile code through the LangGraph server
    """
    try:
        data = await request.json()
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{LANGGRAPH_SERVER_URL}/compile", 
                json=data
            ) as response:
                result = await response.json()
                return JSONResponse(
                    status_code=response.status,
                    content=result
                )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error compiling code: {str(e)}")


@router.post("/run")
async def run_graph(request: Request):
    """
    Proxy endpoint to run a compiled graph through the LangGraph server
    """
    try:
        data = await request.json()
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{LANGGRAPH_SERVER_URL}/run", 
                json=data
            ) as response:
                result = await response.json()
                return JSONResponse(
                    status_code=response.status,
                    content=result
                )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running graph: {str(e)}")


@router.post("/abort")
async def abort_run(request: Request, run_id: str):
    """
    Proxy endpoint to abort a running graph
    """
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{LANGGRAPH_SERVER_URL}/abort?run_id={run_id}"
            ) as response:
                if response.status == 204:  # No content response
                    return JSONResponse(status_code=204, content={})
                result = await response.json()
                return JSONResponse(
                    status_code=response.status,
                    content=result
                )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error aborting run: {str(e)}")
