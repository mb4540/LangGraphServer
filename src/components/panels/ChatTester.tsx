import React from 'react';

const ChatTester: React.FC = () => {
  return (
    <div className="h-full p-4 bg-white shadow-inner">
      <h2 className="text-lg font-bold mb-4">Chat Tester</h2>
      <div className="bg-gray-50 h-[calc(100%-8rem)] rounded-md p-4 border border-gray-200 overflow-y-auto mb-4">
        {/* Chat messages will go here */}
        <div className="text-gray-500 text-center mt-8">No messages yet</div>
      </div>
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatTester;
