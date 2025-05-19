import React, { useState } from 'react';

type Section = {
  id: string;
  title: string;
  content: React.ReactNode;
};

type DocumentationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  if (!isOpen) return null;

  const sections: Section[] = [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">LangGraph Server</h3>
          <p className="mb-4">
            LangGraph Server is a visual development environment for building, testing, and deploying LangGraph workflows.
            It provides a drag-and-drop interface for creating complex AI applications using the LangGraph framework.
          </p>
          <p>
            Use the graph canvas to design your workflow, test it with the chat interface, and export the generated code
            for use in your own applications.
          </p>
        </div>
      ),
    },
    {
      id: 'graph-canvas',
      title: 'Graph Canvas',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Graph Canvas</h3>
          <p className="mb-4">
            The Graph Canvas is where you design your LangGraph workflow by adding nodes and connecting them with edges.
          </p>
          <h4 className="text-md font-semibold mt-4 mb-2">Key Features:</h4>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>Node Types Panel:</strong> Select from various node types to add to your graph. Click the info button (i) for details about each node type.</li>
            <li><strong>Drag and Drop:</strong> Drag nodes from the panel to the canvas to add them to your graph.</li>
            <li><strong>Connections:</strong> Click and drag from a node's output handle to another node's input handle to create connections.</li>
            <li><strong>Node Configuration:</strong> Select a node to view and edit its properties in the detail panel.</li>
            <li><strong>Import/Export:</strong> Save your graph as JSON or load an existing graph.</li>
            <li><strong>Clear Graph:</strong> Remove all nodes and start fresh.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'chat-tester',
      title: 'Chat Tester',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Chat Tester</h3>
          <p className="mb-4">
            The Chat Tester allows you to build and run your graph, then interact with it through a chat interface.
          </p>
          <h4 className="text-md font-semibold mt-4 mb-2">Key Features:</h4>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>Build & Run:</strong> Converts your graph into executable code and runs it.</li>
            <li><strong>Chat Interface:</strong> Send messages to your running graph and see its responses.</li>
            <li><strong>Restart:</strong> Restart the current graph execution.</li>
            <li><strong>Abort:</strong> Stop the current graph execution.</li>
          </ul>
          <p className="mb-4">
            To use the Chat Tester, first design your graph in the Graph Canvas, then click the "Build & Run" button.
            Once the graph is running, you can send messages in the chat interface to interact with it.
          </p>
        </div>
      ),
    },
    {
      id: 'terminal-setup',
      title: 'Terminal & Setup',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Terminal & Setup</h3>
          <p className="mb-4">
            The Terminal & Setup tab provides tools for configuring your LangGraph environment and viewing execution logs.
          </p>
          <h4 className="text-md font-semibold mt-4 mb-2">Key Features:</h4>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>Environment Configuration:</strong> Set up API keys, model preferences, and other settings.</li>
            <li><strong>Execution Logs:</strong> View detailed logs of your graph execution for debugging.</li>
            <li><strong>Backend Status:</strong> Check the status of the backend server.</li>
          </ul>
          <p className="mb-4">
            Before running complex graphs, make sure to configure any required API keys or settings in this tab.
          </p>
        </div>
      ),
    },
    {
      id: 'code-template',
      title: 'Code Template',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Code Template</h3>
          <p className="mb-4">
            The Code Template tab shows the Python code that corresponds to your graph design.
            This code updates in real-time as you modify your graph in the Canvas.
          </p>
          <h4 className="text-md font-semibold mt-4 mb-2">Key Features:</h4>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>Syntax Highlighting:</strong> Code is displayed with syntax highlighting for better readability.</li>
            <li><strong>Node Highlighting:</strong> When you select a node in the Graph Canvas, the corresponding code is highlighted.</li>
            <li><strong>Copy to Clipboard:</strong> Easily copy the generated code for use in your own projects.</li>
          </ul>
          <p className="mb-4">
            The code template provides a complete implementation of your graph using the LangGraph framework,
            including all necessary imports, node definitions, and edge connections.
          </p>
        </div>
      ),
    },
    {
      id: 'detail-panel',
      title: 'Detail Panel',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Detail Panel</h3>
          <p className="mb-4">
            The Detail Panel displays properties and settings for the currently selected node or edge in the Graph Canvas.
          </p>
          <h4 className="text-md font-semibold mt-4 mb-2">Key Features:</h4>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>Node Properties:</strong> Configure node-specific settings like model names, prompt templates, or function parameters.</li>
            <li><strong>Edge Properties:</strong> Set conditions for edge traversal in conditional flows.</li>
            <li><strong>Input/Output Mapping:</strong> For subgraph nodes, configure how data flows in and out of the subgraph.</li>
          </ul>
          <p className="mb-4">
            To edit a node or edge, select it in the Graph Canvas and use the Detail Panel to modify its properties.
          </p>
        </div>
      ),
    },
    {
      id: 'node-types',
      title: 'Node Types',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Node Types</h3>
          <p className="mb-4">
            LangGraph Server supports various node types for building AI workflows.
            Each node type serves a specific purpose in the graph.
          </p>
          <h4 className="text-md font-semibold mt-4 mb-2">Core Flow Nodes:</h4>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>START Node:</strong> Required entry point for every graph.</li>
            <li><strong>END Node:</strong> Terminal node that marks completion of the graph execution.</li>
            <li><strong>Decision Node:</strong> Creates conditional branching based on evaluation of conditions.</li>
          </ul>
          <h4 className="text-md font-semibold mt-4 mb-2">AI Nodes:</h4>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>LLM Node:</strong> Performs language model inference using specified model and prompt.</li>
            <li><strong>Agent Node:</strong> LLM-powered agent that can use tools and make decisions.</li>
          </ul>
          <h4 className="text-md font-semibold mt-4 mb-2">Tool and Memory Nodes:</h4>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>Tool Node:</strong> Executes external tools, API calls, or functions.</li>
            <li><strong>Memory Read/Write:</strong> Retrieves or stores data in persistent memory.</li>
          </ul>
          <h4 className="text-md font-semibold mt-4 mb-2">Flow Control Nodes:</h4>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>Parallel Fork/Join:</strong> Split execution into multiple branches and merge results.</li>
            <li><strong>Loop Node:</strong> Creates cyclic execution patterns with configurable exit conditions.</li>
            <li><strong>Error Retry:</strong> Automatically retries operations that fail.</li>
            <li><strong>Timeout Guard:</strong> Protects against long-running operations.</li>
            <li><strong>Human Pause:</strong> Pauses execution for human intervention.</li>
          </ul>
          <h4 className="text-md font-semibold mt-4 mb-2">Advanced Nodes:</h4>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>Subgraph Node:</strong> Encapsulates an entire graph as a reusable component.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
          <p className="mb-4">
            Follow these steps to create your first LangGraph workflow:
          </p>
          <ol className="list-decimal pl-5 mb-4 space-y-2">
            <li>
              <strong>Start with a START node:</strong> Drag a START node from the Node Types panel to the Graph Canvas.
              This is the entry point of your graph.
            </li>
            <li>
              <strong>Add processing nodes:</strong> Add LLM nodes, Tool nodes, or other processing nodes to perform the desired operations.
            </li>
            <li>
              <strong>Add an END node:</strong> Add an END node to mark the completion of your graph.
            </li>
            <li>
              <strong>Connect the nodes:</strong> Click and drag from a node's output handle to another node's input handle to create connections.
            </li>
            <li>
              <strong>Configure node properties:</strong> Select each node and configure its properties in the Detail Panel.
            </li>
            <li>
              <strong>Test your graph:</strong> Switch to the Chat Tester tab and click "Build & Run" to test your graph.
            </li>
            <li>
              <strong>Export your code:</strong> Once your graph is working as expected, you can copy the code from the Code Template tab
              or export the graph as JSON for later use.
            </li>
          </ol>
          <p className="mb-4">
            For more complex workflows, consider using Decision nodes for conditional branching,
            Loop nodes for repetitive tasks, or Subgraph nodes to encapsulate reusable components.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">LangGraph Server Documentation</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <div className="flex-grow flex overflow-hidden">
          {/* Table of Contents */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto custom-scrollbar">
            <h3 className="text-lg font-semibold mb-4">Contents</h3>
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeSection === section.id ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Content */}
          <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
            {sections.find((section) => section.id === activeSection)?.content}
            
            <div className="mt-8 pt-4 border-t border-gray-200">
              <button
                onClick={() => setActiveSection('overview')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Back to Overview
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentationModal;
