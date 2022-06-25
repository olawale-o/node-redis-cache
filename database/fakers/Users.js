const { faker } = require('@faker-js/faker');

const USERS = [];

function createRandomUser() {
  return {
    email: faker.internet.email(),
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
  }
}

Array.from({ length: 10 }).forEach(() => {
  USERS.push(createRandomUser());
});

module.exports = USERS;