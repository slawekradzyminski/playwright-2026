export type AccountRole = 'ROLE_ADMIN' | 'ROLE_CLIENT';

export type AccountResponse = {
  id: number;
  username: string;
  email: string;
  roles: AccountRole[];
  firstName: string;
  lastName: string;
};

export type AccountEdit = {
  email: string;
  firstName?: string;
  lastName?: string;
};

