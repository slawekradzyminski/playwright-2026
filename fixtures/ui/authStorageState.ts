import type { LoginResponseDto } from '../../types/auth';

export function authStorageState(
  baseURL: string | undefined,
  authentication: Pick<LoginResponseDto, 'token' | 'refreshToken'>
) {
  if (!baseURL) throw new Error('Authenticated UI tests require a configured baseURL');
  return {
    cookies: [],
    origins: [{
      origin: new URL(baseURL).origin,
      localStorage: [
        { name: 'token', value: authentication.token },
        { name: 'refreshToken', value: authentication.refreshToken }
      ]
    }]
  };
}
