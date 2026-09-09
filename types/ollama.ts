export type ToolDefinition = {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, { type: string; description?: string }>;
      required?: string[] | null;
      oneOf?: { required: string[] }[] | null;
    };
  };
};

export type ToolCall = {
  id?: string;
  function: { name: string; arguments: Record<string, unknown> };
};

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content?: string | null;
  thinking?: string | null;
  tool_calls?: ToolCall[] | null;
  tool_name?: string | null;
};

export type OllamaChunk = {
  model: string;
  created_at: string;
  done: boolean;
  response?: string | null;
  thinking?: string | null;
  message?: ChatMessage | null;
};
