const client = require("../database");

async function seedTables(client) {

  try {
    console.log("    creating tables...");

    await client.query(`
      DROP TABLE IF EXISTS hands;
      DROP TABLE IF EXISTS leaderboard;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS types;
      DROP TABLE IF EXISTS cards;
      DROP TABLE IF EXISTS ranks;
      DROP TABLE IF EXISTS suits;
      `);

    await client.query(`
      CREATE TABLE suits(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        "imageUrl" VARCHAR(255) NOT NULL
      )`);

    await client.query(`
      CREATE TABLE ranks(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        value INT UNIQUE NOT NULL
      )`);

    await client.query(`
      CREATE TABLE cards(
        id SERIAL PRIMARY KEY,
        "suitId" INT REFERENCES suits(id) NOT NULL,
        "rankId" INT REFERENCES ranks(id) NOT NULL,
        UNIQUE ("suitId","rankId")
      )`);

    await client.query(`
      CREATE TABLE types(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      )`);

    await client.query(`
      CREATE TABLE users(
        id SERIAL PRIMARY KEY,
        firstname VARCHAR(255),
        lastname VARCHAR(255),
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        hash VARCHAR(255) NOT NULL,
        card1id INT REFERENCES cards(id) NOT NULL,
        card2id INT REFERENCES cards(id) NOT NULL,
        card3id INT REFERENCES cards(id) NOT NULL,
        card4id INT REFERENCES cards(id) NOT NULL,
        card5id INT REFERENCES cards(id) NOT NULL,
        "typeId" INT REFERENCES types(id) NOT NULL
      )`);

    await client.query(`
      CREATE TABLE hands(
        id SERIAL PRIMARY KEY,
        "userId" INT REFERENCES users(id) NOT NULL,
        card1id INT REFERENCES cards(id) NOT NULL,
        card2id INT REFERENCES cards(id) NOT NULL,
        card3id INT REFERENCES cards(id) NOT NULL,
        card4id INT REFERENCES cards(id) NOT NULL,
        card5id INT REFERENCES cards(id) NOT NULL,
        "typeId" INT REFERENCES types(id) NOT NULL,
        UNIQUE ("userId", card1id, card2id, card3id, card4id, card5id)
      )`);

  } catch (error) {
    console.error(error);

  };
};

module.exports = { seedTables };