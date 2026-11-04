export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto extends LoginDto {
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginResponseDto {
  token: string;
  refreshToken: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface ErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

export interface LoggedInUser extends RegisterDto {
  token: string;
  refreshToken: string;
}
