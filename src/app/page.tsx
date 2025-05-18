import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">LangGraph Server</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">Create New Graph</h2>
            <p className="mb-4 text-gray-700">Build a new LangGraph workflow from scratch with our visual editor.</p>
            <Link href="/editor/new" className="inline-block bg-primary hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors">
              Create Graph
            </Link>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">My Graphs</h2>
            <p className="mb-4 text-gray-700">View and manage your existing LangGraph workflows.</p>
            <Link href="/graphs" className="inline-block bg-primary hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors">
              View Graphs
            </Link>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">LangGraph Documentation</h2>
          <p className="mb-4 text-gray-700">
            LangGraph is a library for building stateful, multi-actor applications with LLMs. 
            Learn more about how to use LangGraph with our documentation.
          </p>
          <a 
            href="https://langchain-ai.github.io/langgraph/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-secondary hover:bg-gray-800 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            View Documentation
          </a>
        </div>
      </div>
    </div>
  );
}
