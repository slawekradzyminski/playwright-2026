import { faker } from '@faker-js/faker';
import type { UserRegisterDto } from '../types/auth';

export class UserGenerator {
  static generate(overrides: Partial<UserRegisterDto> = {}): UserRegisterDto {
    const id = faker.string.uuid();
    return {
      username: `test_${id}`,
      email: `test_${id}@example.com`,
      password: faker.internet.password({ length: 20 }),
      // Some real names are shorter than the API's four-character minimum.
      firstName: faker.person.firstName().padEnd(4, 'a').slice(0, 255),
      lastName: faker.person.lastName().padEnd(4, 'a').slice(0, 255),
      ...overrides,
    };
  }
}
