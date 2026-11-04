import { expect, type APIRequestContext } from '@playwright/test';
import type { MfaEnrollment, MfaRecoveryCodesDto, MfaSetupDto, MfaStatusDto } from '../types/mfa';
import { currentTimeStep, totp } from '../utils/totp';

const MFA_ENDPOINT = '/api/v1/users/2fa';

/** Two-factor authentication of the user whose token was supplied. */
export class MfaApi {
  constructor(private readonly request: APIRequestContext, private readonly token: string) {}

  async status(): Promise<MfaStatusDto> {
    const response = await this.request.get(`${MFA_ENDPOINT}/status`, { headers: this.headers() });
    expect(response.status()).toBe(200);
    return response.json();
  }

  async setup(): Promise<MfaSetupDto> {
    const response = await this.request.post(`${MFA_ENDPOINT}/setup`, { headers: this.headers() });
    expect(response.status()).toBe(200);
    return response.json();
  }

  async confirm(code: string): Promise<MfaRecoveryCodesDto> {
    const response = await this.request.post(`${MFA_ENDPOINT}/confirm`, { data: { code }, headers: this.headers() });
    expect(response.status()).toBe(200);
    return response.json();
  }

  /**
   * Sets up and confirms an authenticator. The backend rejects any later code from the
   * returned time step or earlier, so the next sign-in needs a code from `timeStep + 1`.
   */
  async enable(): Promise<MfaEnrollment> {
    const { secret } = await this.setup();
    const timeStep = currentTimeStep();
    await this.confirm(totp(secret, timeStep));
    return { secret, timeStep };
  }

  private headers() {
    return { Authorization: `Bearer ${this.token}` };
  }
}
