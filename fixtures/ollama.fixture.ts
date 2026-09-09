import { randomUUID } from 'node:crypto';
import { test as base } from './resources.fixture';
import { OllamaClient } from '../http/ollamaClient';
import type { ToolDefinition } from '../types/ollama';
import type { ProductDto } from '../types/product';
import { expect } from '@playwright/test';

export const test = base.extend<{ toolDefinitions: ToolDefinition[]; beautyProduct: ProductDto }>({
  toolDefinitions: async ({ request, loggedInUser }, use) => {
    const response = await new OllamaClient(request).getToolDefinitions(loggedInUser.token);
    expect(response.status(), 'Load supported tool definitions for setup').toBe(200);
    await use(await response.json());
  },
  beautyProduct: async ({ productFactory }, use) => {
    await use(await productFactory.create({
      name: `Ollama Beauty ${randomUUID()}`, category: 'beauty', stockQuantity: 3
    }));
  }
});

export { expect } from '@playwright/test';
