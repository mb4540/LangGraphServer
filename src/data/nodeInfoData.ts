// Node information data for the info modal

export type NodeParameter = {
  name: string;
  type: string;
  description: string;
  required: boolean;
};

export type NodeInfo = {
  type: string;
  label: string;
  description: string;
  parameters: NodeParameter[];
  examples?: string[];
  notes?: string;
  className: string;
};

const nodeInfoData: NodeInfo[] = [
  // Core Flow Nodes
  {
    type: 'startNode',
    label: 'START Node',
    description: 'The required entry point of the graph. Every graph must have exactly one START node. This is where execution begins.',
    className: 'bg-emerald-100 border-emerald-500',
    parameters: [
      {
        name: 'label',
        type: 'string',
        description: 'A descriptive name for the node',
        required: false
      }
    ],
    notes: 'The START node initializes the graph state and passes it to the next node in the flow. It cannot have any incoming edges.'
  },
  {
    type: 'endNode',
    label: 'END Node',
    description: 'Marks the termination point of the graph. When execution reaches this node, the graph run is considered complete.',
    className: 'bg-red-100 border-red-500',
    parameters: [
      {
        name: 'label',
        type: 'string',
        description: 'A descriptive name for the node',
        required: false
      }
    ],
    notes: 'The END node finalizes the graph state and returns it as the result of the graph execution. It cannot have any outgoing edges.'
  },
  {
    type: 'decisionNode',
    label: 'Decision Node',
    description: 'Creates conditional branching in the graph flow based on the evaluation of conditions.',
    className: 'bg-yellow-100 border-yellow-500',
    parameters: [
      {
        name: 'label',
        type: 'string',
        description: 'A descriptive name for the node',
        required: false
      },
      {
        name: 'branches',
        type: 'array',
        description: 'List of possible output branches',
        required: true
      },
      {
        name: 'defaultBranch',
        type: 'string',
        description: 'Branch to take if no conditions match',
        required: false
      }
    ],
    examples: [
      'Example condition: state.get("sentiment") === "positive"',
      'Example branches: ["positive", "negative", "neutral"]'
    ],
    notes: 'Decision nodes allow for dynamic routing of the graph execution based on the current state.'
  },
  
  // AI Nodes
  {
    type: 'llmNode',
    label: 'LLM Node',
    description: 'Performs language model inference using the specified model and prompt.',
    className: 'bg-blue-100 border-blue-500',
    parameters: [
      {
        name: 'label',
        type: 'string',
        description: 'A descriptive name for the node',
        required: false
      },
      {
        name: 'modelName',
        type: 'string',
        description: 'The name of the language model to use',
        required: true
      },
      {
        name: 'promptTemplate',
        type: 'string',
        description: 'The prompt template with variable placeholders',
        required: true
      },
      {
        name: 'temperature',
        type: 'number',
        description: 'Controls randomness in generation (0.0-1.0)',
        required: false
      },
      {
        name: 'maxTokens',
        type: 'number',
        description: 'Maximum number of tokens to generate',
        required: false
      }
    ],
    examples: [
      'Prompt template: "Summarize the following text: {input}"',
      'Model name: "gpt-4", "claude-3", "gemini-pro"'
    ]
  },
  {
    type: 'agentNode',
    label: 'Agent Node',
    description: 'An LLM-powered agent that can use tools and make decisions based on a specified objective.',
    className: 'bg-purple-100 border-purple-500',
    parameters: [
      {
        name: 'label',
        type: 'string',
        description: 'A descriptive name for the node',
        required: false
      },
      {
        name: 'modelName',
        type: 'string',
        description: 'The name of the language model to use',
        required: true
      },
      {
        name: 'tools',
        type: 'array',
        description: 'List of tools the agent can use',
        required: true
      },
      {
        name: 'objective',
        type: 'string',
        description: 'The goal the agent should accomplish',
        required: true
      },
      {
        name: 'maxIterations',
        type: 'number',
        description: 'Maximum number of tool-use iterations',
        required: false
      }
    ],
    examples: [
      'Tools: ["web_search", "calculator", "python_repl"]',
      'Objective: "Research the latest AI developments and summarize them"'
    ]
  },

  // Parallel Processing Nodes
  {
    type: 'parallelForkNode',
    label: 'Parallel Fork',
    description: 'Splits the execution flow into multiple concurrent branches.',
    className: 'bg-blue-100 border-blue-500',
    parameters: [
      {
        name: 'label',
        type: 'string',
        description: 'A descriptive name for the node',
        required: false
      },
      {
        name: 'branches',
        type: 'number',
        description: 'Number of parallel branches to create',
        required: true
      }
    ],
    notes: 'Must be paired with a Parallel Join node to merge the results from all branches.'
  },
  {
    type: 'parallelJoinNode',
    label: 'Parallel Join',
    description: 'Merges the results from parallel execution branches.',
    className: 'bg-indigo-100 border-indigo-500',
    parameters: [
      {
        name: 'label',
        type: 'string',
        description: 'A descriptive name for the node',
        required: false
      },
      {
        name: 'mergeStrategy',
        type: 'string',
        description: 'How to combine results from branches (concat, first, last, custom)',
        required: false
      },
      {
        name: 'waitForAll',
        type: 'boolean',
        description: 'Whether to wait for all branches to complete',
        required: false
      }
    ],
    notes: 'Must be preceded by a Parallel Fork node. The mergeStrategy determines how results are combined.'
  },
  {
    type: 'loopNode',
    label: 'Loop Node',
    description: 'Creates cyclic execution patterns with configurable exit conditions.',
    className: 'bg-amber-100 border-amber-500',
    parameters: [
      {
        name: 'label',
        type: 'string',
        description: 'A descriptive name for the node',
        required: false
      },
      {
        name: 'maxIterations',
        type: 'number',
        description: 'Maximum number of loop iterations',
        required: false
      },
      {
        name: 'exitCondition',
        type: 'string',
        description: 'Condition that determines when to exit the loop',
        required: false
      }
    ],
    examples: [
      'Exit condition: state.get("counter") >= 10',
      'Exit condition: state.get("foundAnswer") === true'
    ]
  },
  {
    type: 'errorRetryNode',
    label: 'Error Retry',
    description: 'Automatically retries operations that fail with configurable backoff.',
    className: 'bg-orange-100 border-orange-500',
    parameters: [
      {
        name: 'label',
        type: 'string',
        description: 'A descriptive name for the node',
        required: false
      },
      {
        name: 'maxRetries',
        type: 'number',
        description: 'Maximum number of retry attempts',
        required: true
      },
      {
        name: 'backoffFactor',
        type: 'number',
        description: 'Multiplier for increasing delay between retries',
        required: false
      },
      {
        name: 'initialDelayMs',
        type: 'number',
        description: 'Initial delay in milliseconds before first retry',
        required: false
      }
    ],
    notes: 'Helps make your graph more resilient to transient failures, especially with external API calls.'
  },
  {
    type: 'timeoutGuardNode',
    label: 'Timeout Guard',
    description: 'Protects against long-running operations with configurable timeout policies.',
    className: 'bg-purple-100 border-purple-500',
    parameters: [
      {
        name: 'label',
        type: 'string',
        description: 'A descriptive name for the node',
        required: false
      },
      {
        name: 'timeoutMs',
        type: 'number',
        description: 'Timeout duration in milliseconds',
        required: true
      },
      {
        name: 'fallbackBehavior',
        type: 'string',
        description: 'What to do when timeout occurs (error, default-value, skip)',
        required: false
      }
    ],
    notes: 'Ensures that operations complete within a reasonable time frame, preventing indefinite hangs.'
  },
  {
    type: 'humanPauseNode',
    label: 'Human Pause',
    description: 'Pauses execution for human intervention or approval before continuing.',
    className: 'bg-blue-100 border-blue-500',
    parameters: [
      {
        name: 'label',
        type: 'string',
        description: 'A descriptive name for the node',
        required: false
      },
      {
        name: 'prompt',
        type: 'string',
        description: 'Message to display to the human',
        required: true
      },
      {
        name: 'timeoutMs',
        type: 'number',
        description: 'Optional timeout for human response',
        required: false
      }
    ],
    examples: [
      'Prompt: "Please review the generated content and approve or reject it."',
      'Prompt: "Additional information needed: What is the customer\'s account number?"'
    ]
  },
  {
    type: 'toolNode',
    label: 'Tool Node',
    description: 'Executes an external tool, API call, or function with the provided inputs.',
    className: 'bg-green-100 border-green-500',
    parameters: [
      {
        name: 'label',
        type: 'string',
        description: 'A descriptive name for the node',
        required: false
      },
      {
        name: 'functionName',
        type: 'string',
        description: 'Name of the function or tool to execute',
        required: true
      },
      {
        name: 'inputMapping',
        type: 'object',
        description: 'Mapping from state to function parameters',
        required: false
      },
      {
        name: 'outputMapping',
        type: 'object',
        description: 'Mapping from function results to state',
        required: false
      }
    ],
    examples: [
      'Function: "web_search", Input: { "query": "${state.question}" }',
      'Function: "database_query", Input: { "sql": "SELECT * FROM users WHERE id = ${state.user_id}" }'
    ]
  },
  
  // Memory Nodes
  {
    type: 'memoryReadNode',
    label: 'Memory Read',
    description: 'Retrieves data from persistent memory storage.',
    className: 'bg-cyan-100 border-cyan-500',
    parameters: [
      {
        name: 'label',
        type: 'string',
        description: 'A descriptive name for the node',
        required: false
      },
      {
        name: 'key',
        type: 'string',
        description: 'Key to retrieve from memory',
        required: true
      },
      {
        name: 'outputVar',
        type: 'string',
        description: 'State variable to store the retrieved value',
        required: true
      },
      {
        name: 'defaultValue',
        type: 'any',
        description: 'Value to use if key not found',
        required: false
      }
    ],
    notes: 'Memory persists across graph runs, allowing for stateful applications.'
  },
  {
    type: 'memoryWriteNode',
    label: 'Memory Write',
    description: 'Stores data to persistent memory storage.',
    className: 'bg-teal-100 border-teal-500',
    parameters: [
      {
        name: 'label',
        type: 'string',
        description: 'A descriptive name for the node',
        required: false
      },
      {
        name: 'key',
        type: 'string',
        description: 'Key to store in memory',
        required: true
      },
      {
        name: 'value',
        type: 'string',
        description: 'Value or state variable reference to store',
        required: true
      },
      {
        name: 'ttl',
        type: 'number',
        description: 'Time-to-live in seconds (0 for permanent)',
        required: false
      }
    ],
    notes: 'Use memory nodes to implement conversational history, user preferences, or other stateful features.'
  },
  {
    type: 'subgraphNode',
    label: 'Subgraph Node',
    description: 'Encapsulates an entire graph as a reusable component within the current graph.',
    className: 'bg-indigo-100 border-indigo-500',
    parameters: [
      {
        name: 'label',
        type: 'string',
        description: 'A descriptive name for the node',
        required: false
      },
      {
        name: 'graphId',
        type: 'string',
        description: 'ID of the graph to use as a subgraph',
        required: true
      },
      {
        name: 'inputMapping',
        type: 'object',
        description: 'Mapping from parent graph state to subgraph inputs',
        required: false
      },
      {
        name: 'outputMapping',
        type: 'object',
        description: 'Mapping from subgraph outputs to parent graph state',
        required: false
      }
    ],
    notes: 'Subgraphs promote reusability and modularity in your graph designs. They can be nested to create complex hierarchical workflows.'
  }
];

export default nodeInfoData;
