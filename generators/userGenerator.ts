import { faker } from '@faker-js/faker';
import type { SignupDto } from '../types/auth';

const MIN_NAME_LENGTH = 4;
const MAX_USERNAME_LENGTH = 255;

function generateName(minLength = MIN_NAME_LENGTH): string {
  let name: string;

  do {
    name = faker.person.firstName();
  } while (name.length < minLength);

  return name;
}

function generateLastName(minLength = MIN_NAME_LENGTH): string {
  let name: string;

  do {
    name = faker.person.lastName();
  } while (name.length < minLength);

  return name;
}

function toIdentifier(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

function generateUsername(): string {
  const firstName = generateName();
  const lastName = generateLastName();

  return [
    toIdentifier(firstName),
    toIdentifier(lastName),
    faker.string.numeric({ length: 6 }),
  ].join('.');
}

export function generateSignupUser(
  overrides: Partial<SignupDto> = {},
): SignupDto {
  const firstName = generateName();
  const lastName = generateLastName();

  const username = [
    toIdentifier(firstName),
    toIdentifier(lastName),
    faker.string.numeric({ length: 6 }),
  ].join('.');

  return {
    username,
    email: `${username}@example.test`,
    password: faker.internet.password({
      length: 16,
      memorable: true,
    }),
    firstName,
    lastName,
    ...overrides,
  };
}

export function generateMalformedEmail(): string {
  return `${generateUsername()}.example.com`;
}

export function generateOverlongUsername(
  maxLength = MAX_USERNAME_LENGTH,
): string {
  const parts: string[] = [];
  let length = 0;

  while (length <= maxLength) {
    const part = toIdentifier(generateName());
    parts.push(part);
    length += part.length + (parts.length > 1 ? 1 : 0);
  }

  return parts.join('.');
}