import { expect, type APIRequestContext } from '@playwright/test';
import { generateSignupUser } from '../generators/userGenerator';
import { LoginClient } from '../http/loginClient';
import { SignupClient } from '../http/signupClient';
import { UserClient } from '../http/userClient';
import { ADMIN_PASSWORD, ADMIN_USERNAME } from '../test-config';
import type { SignupDto } from '../types/auth';
import { expectValidLoginResponse } from '../validators/authResponse';

export type LoggedInUser = {
  user: SignupDto;
  token: string;
  refreshToken: string;
};

export async function registerAndLoginUser(request: APIRequestContext, track?: (username: string) => void): Promise<LoggedInUser> {
  const user = generateSignupUser();
  const signupClient = new SignupClient(request);
  const loginClient = new LoginClient(request);

  track?.(user.username);
  const signupResponse = await signupClient.signUp(user);
  expect(signupResponse.status(), 'Create disposable account').toBe(201);

  const loginResponse = await loginClient.signIn({
    username: user.username,
    password: user.password
  });
  const authentication = await expectValidLoginResponse(loginResponse, user.username);

  return {
    user,
    token: authentication.token,
    refreshToken: authentication.refreshToken
  };
}

export async function deleteUserAsAdmin(request: APIRequestContext, username: string): Promise<void> {
  const loginClient = new LoginClient(request);
  const userClient = new UserClient(request);

  const adminLoginResponse = await loginClient.signIn({
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD
  });
  const adminAuthentication = await expectValidLoginResponse(adminLoginResponse, ADMIN_USERNAME);

  const deleteResponse = await userClient.deleteUser(username, adminAuthentication.token);
  expect([204, 404]).toContain(deleteResponse.status());
}

export class AccountFactory {
  private readonly usernames = new Set<string>();

  constructor(private readonly request: APIRequestContext, private readonly adminToken: string) {}

  track(username: string): void {
    this.usernames.add(username);
  }

  create(): Promise<LoggedInUser> {
    return registerAndLoginUser(this.request, username => this.track(username));
  }

  async cleanup(): Promise<void> {
    const results = await Promise.allSettled([...this.usernames].map(async username => {
      const response = await new UserClient(this.request).deleteUser(username, this.adminToken);
      expect([204, 404], `Cleanup account ${username}`).toContain(response.status());
    }));
    const errors = results.flatMap(result => result.status === 'rejected' ? [result.reason] : []);
    if (errors.length) throw new AggregateError(errors, 'Failed to clean up owned accounts');
  }
}
