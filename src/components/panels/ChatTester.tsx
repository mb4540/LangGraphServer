import React, { useState, useRef, useEffect } from 'react';
import { useGraph } from '@/store/graphStore';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
};

type ChatStatus = 'idle' | 'building' | 'running' | 'error';

const ChatTester: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [runId, setRunId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'terminal'>('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { nodes, edges, graphName } = useGraph();
  
  // Auto-scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Clean up WebSocket on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const buildAndRun = async () => {
    try {
      setStatus('building');
      setError(null);
      
      // Close existing WebSocket if any
      if (socket) {
        socket.close();
        setSocket(null);
      }
      
      // Clear previous messages
      setMessages([
        {
          id: Date.now().toString(),
          role: 'system',
          content: 'Building and running your LangGraph...',
          timestamp: new Date()
        }
      ]);
      
      // Create graph payload
      const graphPayload = {
        nodes,
        edges,
        graphName
      };
      
      // Send to backend for code generation
      const codeGenResponse = await fetch('/api/generate_code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(graphPayload)
      });
      
      if (!codeGenResponse.ok) {
        throw new Error(`Failed to generate code: ${codeGenResponse.statusText}`);
      }
      
      const { code } = await codeGenResponse.json();
      
      // Now send the code to the compile endpoint
      const compileResponse = await fetch('/api/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });
      
      if (!compileResponse.ok) {
        throw new Error(`Failed to compile graph: ${compileResponse.statusText}`);
      }
      
      const { compilation_id } = await compileResponse.json();
      
      // Now run the compiled graph
      const runResponse = await fetch('/api/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          compilation_id,
          config: {
            configurable: {
              thread_id: Date.now().toString()
            }
          }
        })
      });
      
      if (!runResponse.ok) {
        throw new Error(`Failed to run graph: ${runResponse.statusText}`);
      }
      
      const { run_id } = await runResponse.json();
      setRunId(run_id);
      
      // Start WebSocket connection
      const ws = new WebSocket(`/api/ws/chat?run_id=${run_id}`);
      
      ws.onopen = () => {
        setStatus('running');
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: Date.now().toString(),
            role: 'system',
            content: 'LangGraph is running. Type a message to interact.',
            timestamp: new Date()
          }
        ]);
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
          setMessages(prevMessages => [
            ...prevMessages,
            {
              id: Date.now().toString(),
              role: data.message.role || 'assistant',
              content: data.message.content,
              timestamp: new Date()
            }
          ]);
        } else if (data.type === 'error') {
          setError(data.error);
          setStatus('error');
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
        setStatus('error');
      };
      
      ws.onclose = () => {
        if (status !== 'error') {
          setStatus('idle');
        }
      };
      
      setSocket(ws);
      
    } catch (err) {
      console.error('Error in build and run:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };
  
  const handleSendMessage = () => {
    if (!input.trim() || !socket || status !== 'running') return;
    
    // Add user message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Send message through WebSocket
    socket.send(JSON.stringify({
      type: 'human_message',
      content: input
    }));
    
    setInput('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleRestart = async () => {
    // Close current socket
    if (socket) {
      socket.close();
      setSocket(null);
    }
    
    // Clear messages and restart
    setStatus('idle');
    setRunId(null);
    setError(null);
    setMessages([]);
    
    // Rebuild and run
    await buildAndRun();
  };
  
  const handleAbort = async () => {
    if (!runId) return;
    
    try {
      // Call abort endpoint
      const abortResponse = await fetch(`/api/abort?run_id=${runId}`, {
        method: 'POST'
      });
      
      if (!abortResponse.ok) {
        throw new Error(`Failed to abort run: ${abortResponse.statusText}`);
      }
      
      // Close WebSocket
      if (socket) {
        socket.close();
        setSocket(null);
      }
      
      setStatus('idle');
      setMessages(prev => [
        ...prev, 
        {
          id: Date.now().toString(),
          role: 'system',
          content: 'Run aborted.',
          timestamp: new Date()
        }
      ]);
      
    } catch (err) {
      console.error('Error aborting run:', err);
      setError(err instanceof Error ? err.message : 'Failed to abort run');
    }
  };
  
  return (
    <div className="h-full flex flex-col p-4 bg-white shadow-inner">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'chat' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat Tester
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'terminal' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('terminal')}
        >
          Terminal & Setup
        </button>
      </div>

      {activeTab === 'chat' ? (
        <>
          {/* Header with controls */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Chat Tester</h2>
            <div className="flex space-x-2">
          <button
            onClick={buildAndRun}
            disabled={status === 'building' || status === 'running'}
            className={`px-4 py-1.5 rounded-md text-white ${status === 'building' || status === 'running' ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'} transition-colors`}
          >
            {status === 'building' ? 'Building...' : 'Build & Run'}
          </button>
          <button
            onClick={handleRestart}
            disabled={status !== 'running' && status !== 'error'}
            className={`px-4 py-1.5 rounded-md ${status === 'running' || status === 'error' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-200 text-gray-500'} transition-colors`}
          >
            Restart
          </button>
          <button
            onClick={handleAbort}
            disabled={status !== 'running'}
            className={`px-4 py-1.5 rounded-md ${status === 'running' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-200 text-gray-500'} transition-colors`}
          >
            Abort
          </button>
        </div>
      </div>
      
      {/* Status indicator */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      {/* Chat messages area */}
      <div className="flex-1 bg-gray-50 rounded-md p-4 border border-gray-200 overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center mt-8">
            Click "Build & Run" to start testing your graph
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-blue-100 ml-auto' : msg.role === 'system' ? 'bg-gray-100 mx-auto text-center' : 'bg-white border border-gray-200'}`}
              >
                <div className="text-sm font-semibold mb-1">
                  {msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'Assistant' : 'System'}
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message input */}
      <div className="flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          disabled={status !== 'running'}
          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleSendMessage}
          disabled={status !== 'running' || !input.trim()}
          className={`ml-2 px-4 py-2 rounded-md ${status === 'running' && input.trim() ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'} transition-colors`}
        >
          Send
        </button>
      </div>
        </>
      ) : (
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-2">How to Start All Services</h2>
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="text-md font-semibold mb-2">1. Start the Backend Server</h3>
              <p className="mb-3">Open a terminal in the project root directory and run:</p>
              <div className="bg-gray-800 text-white p-3 rounded font-mono mb-4">
                <p># Navigate to the backend directory</p>
                <p>cd backend</p>
                <p></p>
                <p># Install Python dependencies (first time only)</p>
                <p>pip install -r requirements.txt</p>
                <p></p>
                <p># Start the backend server</p>
                <p>python run.py</p>
              </div>
              <p className="mb-1">The backend will be available at: <span className="font-mono">http://localhost:8000</span></p>
              <p className="text-sm text-gray-600 mb-4">This runs the FastAPI server with hot-reloading enabled</p>
              
              <h3 className="text-md font-semibold mb-2">2. Start the Frontend Development Server</h3>
              <p className="mb-3">Open another terminal in the project root directory and run:</p>
              <div className="bg-gray-800 text-white p-3 rounded font-mono mb-4">
                <p># Install npm dependencies (first time only)</p>
                <p>npm install</p>
                <p></p>
                <p># Start the development server</p>
                <p>npm run dev</p>
              </div>
              <p className="mb-1">The frontend will be available at: <span className="font-mono">http://localhost:3000</span></p>
              <p className="text-sm text-gray-600">This runs the Next.js application with hot-reloading enabled</p>
            </div>
          </div>
          
          <div className="flex-1 bg-black text-green-400 p-4 rounded-md font-mono overflow-y-auto">
            <p>$ Terminal emulation</p>
            <p>$ Ready for commands...</p>
            <p>$</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatTester;
