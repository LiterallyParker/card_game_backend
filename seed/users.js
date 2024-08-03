const bcrypt = require("bcrypt");
const { users } = require("./data");
const { addUser } = require("../database/users");

async function seedUsers() {
  console.log("     seeding users...");

  try {

    for (let user of users) {

      const { firstname, lastname, username, password } = user;

      await addUser({ firstname, lastname, username, password })
    }

  } catch (error) {
    console.error(error);

  };
};

module.exports = { seedUsers };