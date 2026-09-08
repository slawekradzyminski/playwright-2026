import type { APIRequestContext, APIResponse } from '@playwright/test';
import { ApiClient } from './apiClient';
import type { ChatSystemPromptDto, ToolSystemPromptDto } from '../types/prompt';

export const CHAT_SYSTEM_PROMPT_ENDPOINT = '/api/v1/users/chat-system-prompt';
export const TOOL_SYSTEM_PROMPT_ENDPOINT = '/api/v1/users/tool-system-prompt';

export class PromptClient extends ApiClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  getChatSystemPrompt(token?: string): Promise<APIResponse> {
    return this.getJson(CHAT_SYSTEM_PROMPT_ENDPOINT, token);
  }

  updateChatSystemPrompt(payload: ChatSystemPromptDto, token?: string): Promise<APIResponse> {
    return this.putJson(CHAT_SYSTEM_PROMPT_ENDPOINT, payload, token);
  }

  getToolSystemPrompt(token?: string): Promise<APIResponse> {
    return this.getJson(TOOL_SYSTEM_PROMPT_ENDPOINT, token);
  }

  updateToolSystemPrompt(payload: ToolSystemPromptDto, token?: string): Promise<APIResponse> {
    return this.putJson(TOOL_SYSTEM_PROMPT_ENDPOINT, payload, token);
  }
}
