const { assert } = require("console");
const { generateRandomHand } = require("./cards");
const client = require("./index");

async function getUserCardIds(userId) {
  const SQL = `SELECT card1id, card2id, card3id, card4id, card5id, "typeId"
  FROM users
  WHERE id = $1
  `
  try {
    const { rows: [result] } = await client.query(SQL, [userId]);
    return Object.values(result);
  } catch (error) {
    console.error(error);
  };
};

async function setNewHand(id) {
  SQL = `
  UPDATE users
  SET "card1id"=$1, "card2id"=$2, "card3id"=$3, "card4id"=$4, "card5id"=$5, "typeId"=$6
  WHERE id=$7
  RETURNING id;
  `
  try {
    const hand = await generateRandomHand();
    const { cardIds, type } = hand;
    const SQLvalues = [...cardIds, type.id, id];
    const result = await client.query(SQL, SQLvalues);
    if (!result) return;
    return hand;

  } catch (error) {
    console.error(error);
  };
};

async function getHandById(id) {
  const SQL = `SELECT id, "userId", card1id, card2id, card3id, card4id, card5id, "typeId"
  FROM hands
  WHERE id = $1
  `
  try {
    const { rows: [hand] } = await client.query(SQL, [id]);
    return hand;

  } catch (error) {
    console.error(error);
  }
}

async function deleteHandById(id) {
  const SQL = `DELETE FROM hands WHERE id = $1`
  try {
    const response = await client.query(SQL, [id]);
    if (!response.rowCount) return false;
    return true;
  } catch (error) {
    console.error(error);
  };
};

async function saveUserHand(userId) {
  const SQL = `INSERT INTO hands("userId", card1id, card2id, card3id, card4id, card5id, "typeId")
  VALUES($1, $2, $3, $4, $5, $6, $7)`
  try {
    const SQLvalues = await getUserCardIds(userId);
    const result = await client.query(SQL, [userId, ...SQLvalues]);
    return result.rowCount;

  } catch (error) {
    return;
  };
};

async function getHandsByUserId(userId) {
  const SQL = `SELECT id, "userId", card1id, card2id, card3id, card4id, card5id
  FROM hands
  WHERE "userId" = $1
  `
  try {
    const { rows } = await client.query(SQL, [userId]);
    return rows;

  } catch (error) {
    console.error(error);
  };
};

module.exports = { 
  setNewHand,
  getHandById, 
  deleteHandById, 
  getUserCardIds, 
  saveUserHand, 
  getHandsByUserId
};