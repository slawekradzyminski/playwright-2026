export interface OllamaEvent {
  model: string;
  done: boolean;
  response?: string | null;
  thinking?: string | null;
  message?: {
    role: string;
    content?: string | null;
    thinking?: string | null;
    tool_calls?: Array<{ function: { name: string; arguments: Record<string, unknown> } }>;
    tool_name?: string | null;
  } | null;
}

export interface OllamaRequest {
  model: string;
  prompt?: string;
  messages?: Array<{ role: string; content: string }>;
  think?: boolean;
  tools?: Array<{ type: string; function: { name: string } }>;
}
