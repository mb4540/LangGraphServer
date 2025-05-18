import React from 'react';
import Link from 'next/link';

interface SubgraphRelationshipProps {
  parentGraph?: string;
  graphId: string;
  version?: string;
}

/**
 * Component to display and navigate subgraph relationships
 * This is used in the graph UI to show when a node is using or being used by other graphs
 */
const SubgraphRelationship: React.FC<SubgraphRelationshipProps> = ({
  parentGraph,
  graphId,
  version = 'latest'
}) => {
  return (
    <div className="mt-2 rounded-md bg-indigo-50 border border-indigo-100 p-2">
      <div className="text-xs font-medium text-indigo-800 mb-1">Subgraph Relationship</div>
      
      {parentGraph ? (
        <div className="text-xs text-gray-600 flex items-center">
          <span className="mr-1">Used in:</span>
          <Link href={`/editor/${parentGraph}`} className="text-indigo-600 hover:underline">
            {parentGraph}
          </Link>
        </div>
      ) : null}
      
      <div className="text-xs text-gray-600">
        <span className="mr-1">Graph ID:</span>
        <span className="font-medium">{graphId}</span>
      </div>
      
      <div className="text-xs text-gray-600">
        <span className="mr-1">Version:</span>
        <span className="font-medium">{version}</span>
      </div>
      
      <Link href={`/subgraphs`} className="text-xs text-indigo-600 hover:underline block mt-1">
        Browse All Subgraphs
      </Link>
    </div>
  );
};

export default SubgraphRelationship;
