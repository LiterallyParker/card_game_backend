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
    await seedUsers(client);
    let handCount = 20;
    while (handCount > 0) {
      await setNewHand(1);
      await setNewHand(2);
      await setNewHand(3);
      await saveUserHand(1);
      await saveUserHand(2);
      await saveUserHand(3);
      handCount -= 1;
    }

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