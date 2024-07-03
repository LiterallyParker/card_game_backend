const bcrypt = require("bcrypt");
const { users } = require("./data");
const { addUser } = require("../database/users");

async function seedUsers() {
  console.log("     seeding users...");

  try {

    for (let user of users) {

      const { firstname, lastname, username, email, password } = user;

      await addUser({ firstname, lastname, username, email, password })
    }

    console.log("    ...users seeded.\n");
  } catch (error) {
    console.error(error);

  };
};

module.exports = { seedUsers };