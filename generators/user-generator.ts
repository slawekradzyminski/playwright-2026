import { faker } from '@faker-js/faker';
import type { UserRegisterDto } from '../types/user';

export function generateUser(): UserRegisterDto {
  const id = faker.string.uuid();

  return {
    username: `api-${id}`,
    email: `api-${id}@example.com`,
    password: faker.internet.password({ length: 16 }),
    firstName: generateName(() => faker.person.firstName()),
    lastName: generateName(() => faker.person.lastName()),
  };
}

// Faker can return names shorter than the API's minimum of four characters.
function generateName(createName: () => string): string {
  let name: string;
  do {
    name = createName();
  } while (name.length < 4 || name.length > 255);
  return name;
}
