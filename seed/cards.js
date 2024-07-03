async function seedCards(client) {
  console.log("     seeding cards...");
  const { suits, ranks } = require("./data");

  console.log("     seeding suits...");
  for (const suit of suits) {
    await client.query('INSERT INTO suits(name, "imageUrl") VALUES ($1, $2)', [suit.name, suit.imageUrl]);
  };
  console.log("     seeding ranks...");
  for (const rank of ranks) {
    await client.query('INSERT INTO ranks(name, value) VALUES ($1, $2)', [rank.name, rank.value]);
  };
  
  console.log("     seeding cards...")
  let suitCount = 1;
  let rankCount = 1;
  let suitsLength = suits.length;
  let ranksLength = ranks.length;
  while (suitCount <= suitsLength) {
    while (rankCount <= ranksLength) {
      await client.query('INSERT INTO cards("suitId", "rankId") VALUES ($1, $2)', [suitCount, rankCount])
      rankCount += 1
    }
    if (suitCount <= suitsLength) {
      rankCount = 1
    }
    suitCount += 1
  }
};

module.exports = { seedCards };