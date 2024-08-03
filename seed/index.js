const client = require("../database");
const { seedTables } = require("./tables");
const { seedUsers } = require("./users");
const { seedCards } = require("./cards");
const { seedTypes } = require("./types");
const { setNewHand, saveUserHand } = require("../database/hands");

async function seed(client) {

  try {
    client.connect();
    console.log("[=====] SEEDING [=====]\n");

    await seedTables(client);
    await seedCards(client);
    await seedTypes(client);

    console.log("\n[=====] SEEDED [=====]");
  } catch (error) {
    console.error(error);
  };
};


client.on("error", (error) => {
  console.log(error);
  process.exit(-1);
});

seed(client).catch(console.error).finally(() => {client.end()});