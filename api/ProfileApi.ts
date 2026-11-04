import { expect, type APIRequestContext } from '@playwright/test';
import type { ChatSystemPromptDto, ToolSystemPromptDto, UserDetailsDto } from '../types/profile';

const USERS_ENDPOINT = '/api/v1/users';

/** Profile data of the user whose token was supplied. */
export class ProfileApi {
  constructor(private readonly request: APIRequestContext, private readonly token: string) {}

  details() {
    return this.get<UserDetailsDto>(`${USERS_ENDPOINT}/me`);
  }

  chatPrompt() {
    return this.get<ChatSystemPromptDto>(`${USERS_ENDPOINT}/chat-system-prompt`);
  }

  toolPrompt() {
    return this.get<ToolSystemPromptDto>(`${USERS_ENDPOINT}/tool-system-prompt`);
  }

  private async get<T>(path: string): Promise<T> {
    const response = await this.request.get(path, { headers: { Authorization: `Bearer ${this.token}` } });
    expect(response.status()).toBe(200);
    return response.json();
  }
}
