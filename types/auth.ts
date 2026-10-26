export interface LoginDto {
  username: string;
  password: string;
}

export type UserRole = 'ROLE_ADMIN' | 'ROLE_CLIENT';

interface LoginUserDto {
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: UserRole[];
}

// The token/challenge fields depend on whether the account requires MFA.
export type LoginResponseDto = LoginUserDto & (
  | {
      mfaRequired: false;
      token: string;
      refreshToken: string;
      challengeToken: null;
      challengeExpiresAt: null;
    }
  | {
      mfaRequired: true;
      token: null;
      refreshToken: null;
      challengeToken: string;
      challengeExpiresAt: string;
    }
);

export interface ErrorResponse {
  message: string;
}

export type ValidationErrors = Record<string, string>;
