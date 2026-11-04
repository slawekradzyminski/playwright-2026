import { faker } from '@faker-js/faker';
import type { RegisterDto } from '../types/auth';

function generateName(randomName: () => string): string {
  let name: string;

  // Registration fixtures use single-word names of at least four letters.
  do {
    name = randomName();
  } while (!/^[a-z]{4,20}$/i.test(name));

  return name;
}

export function generateUser(): RegisterDto {
  const firstName = generateName(() => faker.person.firstName());
  const lastName = generateName(() => faker.person.lastName());
  const usernameStem = faker.internet.username({ firstName, lastName })
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8);
  const suffix = faker.string.alphanumeric({ length: 12, casing: 'lower' });

  return {
    username: `${usernameStem}${suffix}`,
    email: faker.internet.email({ firstName, lastName: `${lastName}${suffix}`, provider: 'example.com' }).toLowerCase(),
    password: `Aa1!${faker.internet.password({ length: 12 })}`,
    firstName,
    lastName,
  };
}
