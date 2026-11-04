import type { BrowserContextOptions } from '@playwright/test';

type StorageState = Exclude<BrowserContextOptions['storageState'], string | undefined>;

/** The frontend keeps auth in localStorage, so a browser context created with this state starts logged in. */
export function authStorageState(baseURL: string, { token, refreshToken }: { token: string; refreshToken: string }): StorageState {
  return {
    cookies: [],
    origins: [{
      origin: baseURL,
      localStorage: [
        { name: 'token', value: token },
        { name: 'refreshToken', value: refreshToken },
      ],
    }],
  };
}
