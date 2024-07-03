const client = require("../database");
const { seedTables } = require("./tables");
const { seedUsers } = require("./users");
const { seedCards } = require("./cards");
const { seedTypes } = require("./types");
const { addToLeaderboard } = require("../database/leaderboard");
const { setNewHand } = require("../database/hands");

async function seed(client) {

  try {
    client.connect();
    console.log("[=====] SEEDING [=====]\n");

    await seedTables(client);
    await seedCards(client);
    await seedTypes(client);
    await seedUsers(client);
    let iteratorCount = 300
    console.log(`seeding ${iteratorCount * 3} entries to the leadeboard`)
    while (iteratorCount > 0) {
      const hand1 = await setNewHand(1)
      await addToLeaderboard(1, hand1);
      const hand2 = await setNewHand(2)
      await addToLeaderboard(2, hand2);
      const hand3 = await setNewHand(3)
      await addToLeaderboard(3, hand3);
      iteratorCount -= 1;
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