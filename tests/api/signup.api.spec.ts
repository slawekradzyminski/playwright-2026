import { expect, test } from '@playwright/test';
import {
  generateMalformedEmail,
  generateOverlongUsername,
  generateSignupUser
} from '../../generators/userGenerator';
import { LoginClient } from '../../http/loginClient';
import { SignupClient } from '../../http/signupClient';
import type { SignupDto } from '../../types/auth';
import { expectValidLoginResponse } from '../../validators/authResponse';

type ValidationCase = {
  name: string;
  payload: SignupDto;
  field: keyof SignupDto;
  message: string;
};

type DuplicateCase = {
  field: 'username' | 'email';
  createDuplicatePayload: (payload: SignupDto) => SignupDto;
  message: string;
};

const validationCases: ValidationCase[] = [
  {
    name: 'missing username',
    payload: (() => {
      const { username: _username, ...payload } = generateSignupUser();
      return payload as SignupDto;
    })(),
    field: 'username',
    message: 'Username is required'
  },
  {
    name: 'username shorter than four characters',
    payload: generateSignupUser({ username: 'leo' }),
    field: 'username',
    message: 'Minimum username length: 4 characters'
  },
  {
    name: 'invalid email format',
    payload: generateSignupUser({ email: generateMalformedEmail() }),
    field: 'email',
    message: 'Email should be valid'
  },
  {
    name: 'password shorter than eight characters',
    payload: generateSignupUser({ password: 'Summer7' }),
    field: 'password',
    message: 'Minimum password length: 8 characters'
  },
  {
    name: 'first name shorter than four characters',
    payload: generateSignupUser({ firstName: 'Ana' }),
    field: 'firstName',
    message: 'Minimum firstName length: 4 characters'
  },
  {
    name: 'last name shorter than four characters',
    payload: generateSignupUser({ lastName: 'Lee' }),
    field: 'lastName',
    message: 'Minimum lastName length: 4 characters'
  }
];

const duplicateCases: DuplicateCase[] = [
  {
    field: 'username',
    createDuplicatePayload: payload => ({
      ...payload,
      email: generateSignupUser().email
    }),
    message: 'Username is already in use'
  },
  {
    field: 'email',
    createDuplicatePayload: payload => ({
      ...payload,
      username: generateSignupUser().username
    }),
    message: 'Email is already in use'
  }
];

test.describe('/api/v1/users/signup API tests', () => {
  let signupClient: SignupClient;

  test.beforeEach(({ request }) => {
    signupClient = new SignupClient(request);
  });

  test('should create an account that can authenticate immediately - 201', async ({ request }) => {
    // given
    const payload = generateSignupUser();

    // when
    const response = await signupClient.signUp(payload);

    // then
    expect(response.status()).toBe(201);
    expect(await response.text()).toBe('');
  });

  for (const validationCase of validationCases) {
    test(`should return a validation error for ${validationCase.name} - 400`, async () => {
      // when
      const response = await signupClient.signUp(validationCase.payload);

      // then
      expect(response.status()).toBe(400);
      const responseBody = await response.json();
      expect(responseBody[validationCase.field]).toBe(validationCase.message);
    });
  }

  for (const duplicateCase of duplicateCases) {
    test(`should reject a duplicate ${duplicateCase.field} - 400`, async () => {
      // given
      const payload = generateSignupUser();
      const initialResponse = await signupClient.signUp(payload);
      expect(initialResponse.status()).toBe(201);

      // when
      const response = await signupClient.signUp(duplicateCase.createDuplicatePayload(payload));

      // then
      expect(response.status()).toBe(400);
      await expect(response.json()).resolves.toEqual({ message: duplicateCase.message });
    });
  }
});
