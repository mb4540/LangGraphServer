import React, { useState } from 'react';

interface JSONModalProps {
  isOpen: boolean;
  mode: 'import' | 'export';
  content?: string;
  onClose: () => void;
  onSubmit?: (jsonString: string) => void;
}

const JSONModal: React.FC<JSONModalProps> = ({ isOpen, mode, content = '', onClose, onSubmit }) => {
  const [jsonContent, setJsonContent] = useState(content);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (mode === 'import' && onSubmit) {
      onSubmit(jsonContent);
    } else if (mode === 'export') {
      // Copy to clipboard
      navigator.clipboard.writeText(jsonContent)
        .then(() => {
          alert('JSON copied to clipboard');
          onClose();
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          alert('Failed to copy to clipboard');
        });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {mode === 'import' ? 'Import Graph JSON' : 'Export Graph JSON'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="mb-4">
          <textarea
            className="w-full h-64 p-2 border rounded font-mono text-sm"
            value={jsonContent}
            onChange={(e) => setJsonContent(e.target.value)}
            readOnly={mode === 'export'}
            placeholder={mode === 'import' ? 'Paste your LangGraph-compatible JSON here' : ''}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {mode === 'import' ? 'Import' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JSONModal;
