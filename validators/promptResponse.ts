import { expect, type APIResponse } from '@playwright/test';
import { expectJson } from './jsonResponse';
import type { ChatSystemPromptDto, ToolSystemPromptDto } from '../types/prompt';

export async function expectChatSystemPrompt(response: APIResponse, status: number): Promise<ChatSystemPromptDto> {
  const body = await expectJson<ChatSystemPromptDto>(response, status);
  expect(Object.keys(body)).toEqual(['chatSystemPrompt']);
  expect(typeof body.chatSystemPrompt).toBe('string');
  return body;
}

export async function expectToolSystemPrompt(response: APIResponse, status: number): Promise<ToolSystemPromptDto> {
  const body = await expectJson<ToolSystemPromptDto>(response, status);
  expect(Object.keys(body)).toEqual(['toolSystemPrompt']);
  expect(typeof body.toolSystemPrompt).toBe('string');
  return body;
}
