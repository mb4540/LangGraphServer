import React from 'react';

type NodeInfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  nodeType: string;
  nodeInfo: {
    label: string;
    description: string;
    parameters: Array<{
      name: string;
      type: string;
      description: string;
      required: boolean;
    }>;
    examples?: string[];
    notes?: string;
  };
};

const NodeInfoModal: React.FC<NodeInfoModalProps> = ({ isOpen, onClose, nodeType, nodeInfo }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">{nodeInfo.label}</h2>
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
        <div className="px-6 py-4 overflow-y-auto flex-grow custom-scrollbar">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{nodeInfo.description}</p>
          </div>
          
          {nodeInfo.parameters && nodeInfo.parameters.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Parameters</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {nodeInfo.parameters.map((param, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{param.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{param.type}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {param.required ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Required
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Optional
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{param.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {nodeInfo.examples && nodeInfo.examples.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Examples</h3>
              <div className="space-y-2">
                {nodeInfo.examples.map((example, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md">
                    <pre className="text-sm whitespace-pre-wrap">{example}</pre>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {nodeInfo.notes && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <p className="text-gray-700">{nodeInfo.notes}</p>
            </div>
          )}
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

export default NodeInfoModal;
